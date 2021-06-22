const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Post = require("../../models/PostSchema");
const User = require("../../models/UserSchema");

router.post("/", async (req, res) => {
	if (!req.body.content || !req.body) {
		return res.status(400).send();
	}

	const postData = new Post({
		content: req.body.content,
		postedBy: req.session.user._id,
	});

	await postData.populate("postedBy").execPopulate();

	try {
		await postData
			.save()
			.then(() => {
				res.status(201).send(postData);
			}) //! To change
			.catch((error) => res.status(400).json({ errorMessage: error }));
	} catch (error) {
		res.status(500).send({ errorMessage: "Internal Server Error" });
	}
});

router.post("/reply", async (req, res) => {
	const data = new Post({
		content: req.body.content,
		replyTo: req.body.toReplyId,
		postedBy: req.session.user._id,
	});

	await data.populate("postedBy").execPopulate();

	try {
		await data
			.save()
			.then((replyData) => {
				console.log(replyData);
				res.status(201).send(replyData);
			}) //! To change
			.catch((error) => res.status(400).json({ errorMessage: error }));
	} catch (error) {
		res.status(500).send({ errorMessage: "Internal Server Error" });
	}
});

router.get("/", (req, res) => {
	const id = mongoose.Types.ObjectId(req.session.user._id);

	try {
		Post.find({ postedBy: id })
			.populate("postedBy")
			.populate("repostData")
			.populate("replyTo")
			.sort({ createdAt: -1 })
			.then(async (postData) => {
				postData = await User.populate(postData, {
					path: "replyTo.postedBy",
					model: "User",
				});

				postData = await User.populate(postData, {
					path: "repostData.postedBy",
				});
				res.status(200).send(postData);
			})
			.catch((error) => {
				res.status(400).send(error);
			});
	} catch (error) {
		res.status(500).send(error);
	}
});

router.get("/:id", async (req, res) => {
	const postId = req.params.id;

	try {
		let post = await Post.findById(postId)
			.populate("postedBy")
			.populate("replyTo")
			.populate({
				path: "replyTo",
				populate: { path: "postedBy", model: "User" },
			})

			.catch((error) => res.sendStatus(400));

		if (post.replyTo) {
			post = await Post.findById(post.replyTo)
				.populate("postedBy")
				.populate("replyTo")
				.populate({
					path: "replyTo",
					populate: { path: "postedBy", model: "User" },
				})

				.catch((error) => res.sendStatus(400));
		}
		const results = {
			post,
		};
		results.replies = await Post.find({ replyTo: results.post._id })
			.populate("postedBy")
			.populate("replyTo")
			.populate({
				path: "replyTo",
				populate: { path: "postedBy", model: "User" },
			})
			.sort({ createdAt: -1 })
			.catch((error) => res.sendStatus(400));

		console.log(results);
		res.status(200).send(results);
	} catch (error) {
		res.status(500).send();
	}
});

router.put("/:id/like", async (req, res) => {
	const postId = req.params.id;
	const userId = req.session.user._id;
	const isLiked =
		req.session.user.likes && req.session.user.likes.includes(postId);

	const option = isLiked ? "$pull" : "$addToSet";

	//$pull is removing something from an array/set
	// put the option variable inside a square bracket so that mongoose
	// will recognize it as our variable.

	//Users
	req.session.user = await User.findByIdAndUpdate(
		userId,
		{
			[option]: { likes: postId },
		},
		{ new: true }
	).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	req.session.save(); //This saves the new data for the session

	const post = await Post.findByIdAndUpdate(
		postId,
		{
			[option]: { likes: userId },
		},
		{ new: true }
	).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	res.status(200).send(post);
	// This is sending the newly updated post with
	// the likes.

	// {new: true} would tell mongoose to return the new updated data
	// By default findByIdAndUpdate would not return the updated Data
});

router.post("/:id/retweet", async (req, res) => {
	const postId = req.params.id;
	const userId = req.session.user._id;

	//We need to delete the post that the user has retweeted
	//That would essentially mean that we are unretweeting the post
	// we will be deleting and not updating it because essentially
	// we are making a new post by retweeting
	const deletedPost = await Post.findOneAndDelete({
		postedBy: userId,
		repostData: postId,
	}).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	const option = deletedPost ? "$pull" : "$addToSet";
	let repost = deletedPost;

	//if a post is not found or if the user has not retweeted the post yet
	//we will create a new post and not provide the contents for the post
	// because the contents of the post should be populated using the postId
	// sotred in the repostData.
	if (!repost) {
		const repostData = {
			postedBy: userId,
			repostData: postId,
		};
		repost = await Post.create(repostData).catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
	}

	//We then need to cache the data to get the updated data from the database
	// and outputing it to the client
	req.session.user = await User.findByIdAndUpdate(
		userId,
		{
			//Since we have created a new post for the retweet, we would not use the
			// original post's id to be stored in the retweet,
			//but the id from the post created by the user by retweeting the
			// original post. - repost._id
			[option]: { retweets: repost._id },
		},
		{ new: true }
	).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	req.session.save(); // we have to change the changes to the session to successfully
	// cache the data

	const post = await Post.findByIdAndUpdate(
		postId,
		{
			[option]: { retweetUser: userId },
		},
		{ new: true }
	).catch((error) => {
		console.log(error);
		res.sendStatus(400);
	});

	// await repost.populate("repostData").populate("postedBy").execPopulate();

	res.status(201).send(post);
});
module.exports = router;
