import { getId } from "./queries.js";
import { drawData, userData } from "./user.js";

let loading = false;

let btn = document.getElementById("searchBtn");
btn.addEventListener("click", async (_) => {
	let userId = await getId(document.getElementById("searchInput").value);
	if (userId == undefined) {
		removeGraphs();
		window.alert("Username doesn't exist.");
	} else {
		if (!loading) {
			loading = true;
			removeGraphs();
			await drawData(userId.login, userId.id);
			loading = false;
		}
	}
});

function removeGraphs() {
	userData.totalXp = 0;
	userData.xpAndDate = [];
	userData.xpByProject = [];
	let myNode = document.getElementById("infoBoxes");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.lastChild);
	}
	myNode = document.getElementById("graphs");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.lastChild);
	}
}
