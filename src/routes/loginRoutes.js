const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/UserSchema");
router.get("/", (req, res) => {
	res.status(200).render("login");
});

router.post("/", async (req, res) => {
	const { logUsername, logPassword } = req.body;
	const payload = {};

	try {
		await User.findOne({
			$or: [{ email: logUsername }, { userName: logUsername }],
		}).then(async (user) => {
			if (user) {
				const result = await bcrypt.compare(logPassword, user.password);

				if (result) {
					req.session.user = user;
					// res.status(200).send(user);
					return res.redirect("/");
				}

				payload.errorMessage = "Login Credentials Incorrect!";
				return res.status(200).render("login", payload);
			} else {
				payload.errorMessage = "Login Credentials Incorrect!";
				return res.status(200).render("login", payload);
			}
		});
	} catch (error) {
		res.status(500).send(error);
	}
});

module.exports = router;
