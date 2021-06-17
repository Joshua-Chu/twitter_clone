const express = require("express");
const router = express.Router();
const User = require("../models/UserSchema");

router.get("/", (req, res) => {
	res.status(200).render("register");
});

router.post("/", async (req, res) => {
	const { password, passwordConf } = req.body;
	const firstName = req.body.firstName.trim();
	const lastName = req.body.lastName.trim();
	const userName = req.body.userName.trim();
	const email = req.body.email.trim();

	const data = { firstName, lastName, userName, email, password, passwordConf };
	const user = new User(data);

	try {
		await user.save().then((user) => {
			req.session.user = user;
			res.redirect("/");
		});
	} catch (error) {
		let errorMessage;
		if (error.keyValue.email) {
			errorMessage = "Email already exists!";
		} else {
			errorMessage = "Username already exists!";
		}
		const payload = {
			firstName,
			lastName,
			userName,
			email,
			errorMessage,
		};
		res.status(200).render("register", payload);
	}
});

module.exports = router;
