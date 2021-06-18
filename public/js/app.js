const submitButton = document.getElementById("submitButton");
const textArea = document.getElementById("postTextArea");
// const postContainer = document.getElementById("postContainer");

textArea.addEventListener("input", () => {
	if (textArea.value.trim() !== "") {
		submitButton.disabled = false;
		submitButton.classList.add("allowedSubmit");
	} else {
		submitButton.disabled = true;
		submitButton.classList.remove("allowedSubmit");
	}
});

const submitHandler = (e) => {
	e.preventDefault();
	const value = textArea.value;
	const _data = {
		content: value,
	};
	fetch("/api/posts", {
		method: "POST",
		body: JSON.stringify(_data),
		headers: { "Content-type": "application/json; charset=UTF-8" },
	})
		.then((response) => response.json())
		.then((postData) => {
			console.log(postData);
			const html = CreatePostHTML(postData);
			$("#postContainer").prepend(html);
		})
		.catch((err) => console.log(err));

	textArea.value = "";
	submitButton.disabled = true;
	submitButton.classList.remove("allowedSubmit");
};

submitButton.addEventListener("click", submitHandler);

const CreatePostHTML = (postData) => {
	var postedBy = postData.postedBy;
	var displayName = postedBy.firstName + " " + postedBy.lastName;
	var timestamp = postData.createdAt;

	let data = `<div class='post'>
	<div class='mainContentContainer'>
		<div class='userImageContainer'>
			<img src='${postedBy.profilePic}'>
		</div>
		<div class='postContentContainer'>
			<div class='header'>
				<a href='/profile/${postedBy.userName}' class='displayName'>${displayName}</a>
				<span class='username'>@${postedBy.userName}</span>
				<span class='date'>${timestamp}</span>
			</div>
			<div class='postBody'>
				<span>${postData.content}</span>
			</div>
			<div class='postFooter'>
				<div class='postButtonContainer'>
					<button>
						<i class='far fa-comment'></i>
					</button>
				</div>
				<div class='postButtonContainer'>
					<button>
						<i class='fas fa-retweet'></i>
					</button>
				</div>
				<div class='postButtonContainer'>
					<button>
						<i class='far fa-heart'></i>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>`;
	return data;
};
