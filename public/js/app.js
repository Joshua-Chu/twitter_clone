window.addEventListener("click", (e) => {
	if (e.target.id === "likeButton" || e.target.id === "likeIcon") {
		const button = $(e.target);
		const postId = getPostIdFromRoot(button);
		fetch(`/api/posts/${postId}/like`, {
			method: "PUT",
		})
			.then((res) => res.json())
			.then((res) => {
				button.find("span").text(res.likes.length || "");

				if (res.likes.includes(userLoggedIn._id)) {
					button.addClass("active");
				} else {
					button.removeClass("active");
				}
			});
	} else if (e.target.id === "retweetButton" || e.target.id === "retweetIcon") {
		const button = $(e.target);
		const postId = getPostIdFromRoot(button);
		fetch(`/api/posts/${postId}/retweet`, {
			method: "POST",
		})
			.then((res) => res.json())
			.then((res) => {
				console.log(res);
				button.find("span").text(res.retweetUser.length || "");

				if (res.retweetUser.includes(userLoggedIn._id)) {
					button.addClass("active");
				} else {
					button.removeClass("active");
				}
			});
	}
});

const getPostIdFromRoot = (element) => {
	const isRoot = element.hasClass("post");
	const rootElement = isRoot ? element : element.closest(".post");
	const postId = rootElement.data().id;

	return postId;
};

const submitButton = document.getElementById("submitButton");
const textArea = document.getElementById("postTextArea");

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

export const CreatePostHTML = (postData) => {
	//Handling retweets
	var isRetweet = postData.repostData !== undefined;
	var retweetedBy = isRetweet ? postData.postedBy.userName : null;
	postData = isRetweet ? postData.repostData : postData;

	var retweetText = isRetweet ? "@" + retweetedBy : "";
	var retweetedByText = isRetweet
		? `<i class='fas fa-retweet' id="retweetIcon"></i> Retweeted By`
		: "";

	//
	var postedBy = postData.postedBy;
	var displayName = postedBy.firstName + " " + postedBy.lastName;
	var timestamp = timeDifference(new Date(), new Date(postData.createdAt));
	var isLiked = postData.likes.includes(userLoggedIn._id) ? "active" : "";
	var isRetweeted = postData.retweetUser.includes(userLoggedIn._id)
		? "active"
		: "";

	let data = `<div class='post' data-id='${postData._id}'>
		<div class="postActionContainer">${retweetedByText}<a href="/profile/${retweetedBy}"><span>${retweetText}</span></a></div>
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
					<button id="retweetButton" class="${isRetweeted} green">
						<i class='fas fa-retweet' id="retweetIcon"></i>
						<span id="numOfretweets">${postData.retweetUser.length || ""}</span>
					</button>
				</div>
				<div class='postButtonContainer'>
					<button id="likeButton" class="${isLiked} red">
						<i class='far fa-heart' id="likeIcon"></i>
						<span id="numOfLikes">${postData.likes.length || ""}</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>`;
	return data;
};

function timeDifference(current, previous) {
	var msPerMinute = 60 * 1000;
	var msPerHour = msPerMinute * 60;
	var msPerDay = msPerHour * 24;
	var msPerMonth = msPerDay * 30;
	var msPerYear = msPerDay * 365;

	var elapsed = current - previous;

	if (elapsed < msPerMinute) {
		if (elapsed / 1000 < 30) {
			return "Just now";
		}
		return Math.round(elapsed / 1000) + " seconds ago";
	} else if (elapsed < msPerHour) {
		return Math.round(elapsed / msPerMinute) + " minutes ago";
	} else if (elapsed < msPerDay) {
		return Math.round(elapsed / msPerHour) + " hours ago";
	} else if (elapsed < msPerMonth) {
		return Math.round(elapsed / msPerDay) + " days ago";
	} else if (elapsed < msPerYear) {
		return Math.round(elapsed / msPerMonth) + " months ago";
	} else {
		return Math.round(elapsed / msPerYear) + " years ago";
	}
}
