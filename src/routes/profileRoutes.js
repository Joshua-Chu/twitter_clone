const express = require("express");
const User = require("../models/UserSchema");
const Post = require("../models/PostSchema");
const router = express.Router();

router.get("/", (req, res) => {
	const payload = {
		pageTitle: req.session.user.userName,
		userLoggedIn: req.session.user,
		userLoggedInJS: JSON.stringify(req.session.user),
		profileUser: req.session.user,
	};

	res.render("profilePage", payload);
});

router.get("/:userName", async (req, res) => {
	const userName = req.params.userName;
	console.log(`Username: ${userName}`);

	try {
		const user = await User.findOne({ userName: userName }).catch((error) =>
			res.sendStatus(400)
		);

		const result = {
			user,
		};

		const posts = await Post.find({ postedBy: user._id }).catch((error) =>
			res.sendStatus(500)
		);

		result.posts = posts;

		res.status(200).json(result);
	} catch (error) {
		res.status(500).send();
	}
});
module.exports = router;
