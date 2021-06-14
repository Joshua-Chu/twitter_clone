const express = require("express");
const app = express();
const PORT = process.env.PORT || 3003;

app.set("view engine", "pug");
app.set("views", "views");

app.get("/", (req, res) => {
	res.render("home");
});

app.listen(PORT, () => {
	console.log(`Server listening at http://localhost:${PORT}`);
});
