import { CreatePostHTML } from "./app.js";

const getPosts = async () => {
	const posts = await fetch(`/api/posts/${postId}`);
	const result = await posts.json();

	outputPosts(result.post, $("#postContainer"));

	if (result.replies) {
		console.log(result.replies);
		outputReplies(result.replies, $("#repliesContainer"));
	}
};

const outputPosts = (post, container) => {
	container.html("");
	let html = CreatePostHTML(post);

	if (post._id === postId) {
		html = CreatePostHTML(post, true);
	}
	container.append(html);
};

const outputReplies = (posts, container) => {
	container.html("");

	posts.forEach((post) => {
		let html = CreatePostHTML(post);

		if (post._id === postId) {
			html = CreatePostHTML(post, true);
		}
		container.append(html);
	});
};

console.log("Hello World");
console.log(postId);
console.log(userLoggedIn);

getPosts();
