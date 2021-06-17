const mongoose = require("mongoose");
const url =
	"mongodb+srv://admin:1234@twittercluster.wapq5.mongodb.net/twitterCloneDB?retryWrites=true&w=majority";

const dev_url = "mongodb://127.0.0.1:27017/twitter_clone";
mongoose
	.connect(dev_url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => {
		console.log("Successfully Connected to the Database!");
	})
	.catch((err) => {
		console.log("Unable to connect to the Database! " + err);
	});
