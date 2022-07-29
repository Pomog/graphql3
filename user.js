import { div01CompletedTasksID, div01TaskXP } from "./queries.js";

export async function drawData(username, userId) {
	let loading = document.getElementById("loading");
	let loader = document.createElement("div");
	loader.classList.add("loader");
	loading.appendChild(loader);
	await getData(username);
	loading.removeChild(loader);

	let infoBoxes = document.getElementById("infoBoxes");
	let usernameBox = document.createElement("div");
	usernameBox.classList.add("box");
	usernameBox.innerText = "Username: " + username + "\n" + "ID: " + userId;
	infoBoxes.appendChild(usernameBox);

	let xpBox = document.createElement("div");
	xpBox.classList.add("box");
	let lvl = calculateLevel(userData.totalXp);
	xpBox.innerText =
		"Level: " +
		lvl +
		"\n" +
		"XP: " +
		Math.round(userData.totalXp / 1000) +
		"kB";
	infoBoxes.appendChild(xpBox);

	xpOverTimeChart();
	xpByProjectChart();
}

export let userData = {
	totalXp: 0,
	xpAndDate: [],
	xpByProject: [],
};

function calculateLevel(xp) {
	let level = 0;

	while (levelNeededXP(++level) < xp) {}

	return level - 1;
}

function levelNeededXP(level) {
	return Math.round(level * (176 + 3 * level * (47 + 11 * level)));
}

let getData = async (username) => {
	let response = await div01CompletedTasksID(username);
	const completedTasks = response.data.user[0].progresses;
	for (let completedTask of completedTasks) {
		const taskID = completedTask.object.id;
		response = await div01TaskXP(username, taskID);

		userData.xpAndDate.push({
			xp: response.data.user[0].transactions[0].amount,
			date: new Date(
				response.data.user[0].transactions[0].createdAt.substr(0, 10)
			),
		});

		userData.xpByProject.push({
			xp: response.data.user[0].transactions[0].amount,
			project: response.data.user[0].transactions[0].object.name,
			date: new Date(
				response.data.user[0].transactions[0].createdAt.substr(0, 10)
			),
		});

		const taskXP = response.data.user[0].transactions[0].amount;
		userData.totalXp += taskXP;
	}

	userData.xpAndDate.sort((a, b) => a.date - b.date);
	userData.xpByProject.sort((a, b) => a.date - b.date);
	let lastXp = 0;
	userData.xpAndDate.forEach((task) => {
		task.xp += lastXp;
		lastXp = task.xp;
	});
};

const xpOverTimeChart = (_) => {
	let charts = document.getElementById("graphs");
	let chart = document.createElement("div");
	chart.setAttribute("id", "chart1");
	charts.appendChild(chart);
	charts.appendChild(document.createElement("br"));

	// set the dimensions and margins of the graph
	var margin = { top: 10, right: 30, bottom: 30, left: 60 },
		width = 800 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	var svg = d3
		.select("#chart1")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Add X axis --> it is a date format
	var x = d3
		.scaleTime()
		.domain(
			d3.extent(userData.xpAndDate, function (d) {
				return d.date;
			})
		)
		.range([0, width]);
	svg
		.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	// Add Y axis
	var y = d3
		.scaleLinear()
		.domain([
			0,
			d3.max(userData.xpAndDate, function (d) {
				return +d.xp;
			}),
		])
		.range([height, 0]);
	svg
		.append("g")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("fill", "#000")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("TOTAL XP");

	// Add the line
	svg
		.append("path")
		.datum(userData.xpAndDate)
		.attr("fill", "none")
		.attr("stroke", "#0b7dda")
		.attr("stroke-width", 5)
		.attr(
			"d",
			d3
				.line()
				.x(function (d) {
					return x(d.date);
				})
				.y(function (d) {
					return y(d.xp);
				})
		);
};

const xpByProjectChart = (_) => {
	let charts = document.getElementById("graphs");
	let chart = document.createElement("div");
	chart.setAttribute("id", "chart2");
	charts.appendChild(chart);

	// set the dimensions and margins of the graph
	var margin = { top: 30, right: 30, bottom: 130, left: 60 },
		width = 800 - margin.left - margin.right,
		height = 600 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	var svg = d3
		.select("#chart2")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// X axis
	var x = d3
		.scaleBand()
		.range([0, width])
		.domain(
			userData.xpByProject.map(function (d) {
				return d.project;
			})
		)
		.padding(0.2);
	svg
		.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	// Add Y axis
	var y = d3
		.scaleLinear()
		.domain([0, Math.max(...userData.xpByProject.map((o) => o.xp)) + 5000])
		.range([height, 0]);
	svg
		.append("g")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("fill", "#000")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("PROJECT XP");

	// Bars
	svg
		.selectAll("mybar")
		.data(userData.xpByProject)
		.enter()
		.append("rect")
		.attr("x", function (d) {
			return x(d.project);
		})
		.attr("y", function (d) {
			return y(d.xp);
		})
		.attr("width", x.bandwidth())
		.attr("height", function (d) {
			return height - y(d.xp);
		})
		.attr("fill", "#0b7dda");
};
