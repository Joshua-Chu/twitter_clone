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

module.exports = router;
