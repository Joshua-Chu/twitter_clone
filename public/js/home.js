import { CreatePostHTML } from "./app.js";

const getPosts = async () => {
	const posts = await fetch("/api/posts");
	const result = await posts.json();

	console.log(result);
	outputPosts(result, $("#postContainer"));
};

const outputPosts = (posts, container) => {
	container.html("");

	if (posts.length === 0) {
		container.append(`<span class="noResults">No Results Found...</span>`);
	}
	posts.forEach((post) => {
		const html = CreatePostHTML(post);
		container.append(html);
	});
};

getPosts();
