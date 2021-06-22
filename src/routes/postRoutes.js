const express = require("express");
const router = express.Router();
const Post = require("../models/PostSchema");
const User = require("../models/UserSchema");

router.get("/:id", async (req, res) => {
	const postId = req.params.id;
	const payload = {
		pageTitle: "Post View",
		postId,
		userLoggedIn: req.session.user,
		userLoggedInJS: JSON.stringify(req.session.user),
	};

	console.log(payload);

	res.status(200).render("postView", payload);
});

module.exports = router;
