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

router.get("/", (req, res) => {
	const id = mongoose.Types.ObjectId(req.session.user._id);

	try {
		Post.find({ postedBy: id })
			.populate("postedBy")
			.sort({ createdAt: -1 })
			.then((postData) => {
				res.status(200).send(postData);
			})
			.catch((error) => {
				res.status(400).send(error);
			});
	} catch (error) {
		res.status(500).send(error);
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
	);

	req.session.save(); //This saves the new data for the session

	const post = await Post.findByIdAndUpdate(
		postId,
		{
			[option]: { likes: userId },
		},
		{ new: true }
	);

	res.status(200).send(post);
	// This is sending the newly updated post with
	// the likes.

	// {new: true} would tell mongoose to return the new updated data
	// By default findByIdAndUpdate would not return the updated Data
});
module.exports = router;
