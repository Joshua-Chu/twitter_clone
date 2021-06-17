exports.requireLogin = (req, res, next) => {
	if (req.session && req.session.user) {
		console.log(req.session);
		next();
	} else {
		return res.redirect("/login");
	}
};
