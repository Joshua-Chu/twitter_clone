const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
	{
		content: {
			type: String,
			trim: true,
		},
		postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		pinned: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
