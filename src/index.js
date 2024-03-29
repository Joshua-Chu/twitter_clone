const express = require("express");
const session = require("express-session");
const middleware = require("./middleware/middleware");
const app = express();
const PORT = process.env.PORT || 3003;

//Database Connection
require("../database/database");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
	session({
		secret: "mannersmakethman",
		resave: true,
		saveUninitialized: false,
	})
);

//! Logging the URL
app.use((req, res, next) => {
	console.log(req.url);
	next();
});

app.set("view engine", "pug");
app.set("views", "views");

app.get("/", middleware.requireLogin, (req, res) => {
	const payload = {
		pageTitle: "Home",
		userLoggedIn: req.session.user,
		userLoggedInJS: JSON.stringify(req.session.user),
	};
	res.render("home", payload);
});

//*ROUTES :

const loginRoute = require("./routes/loginRoutes");
const logoutRoute = require("./routes/logoutRoute");
const registerRoute = require("./routes/registerRoute");
const postRoute = require("./routes/postRoutes");
const postsApi = require("./routes/api/posts");
const profileRoute = require("./routes/profileRoutes");

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/profile", profileRoute);
app.use("/api/posts", postsApi);
app.use("/post", middleware.requireLogin, postRoute);

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
});
