import DeviceShare from "./dataProcessors/deviceShare.js"
import ListeningClock from "./dataProcessors/listeningClock.js";
import TopList from "./dataProcessors/topList.js";

var dataFolder;
var currentChart;
var currentProcessor;

//TODO use this to generate a list in the control panel
const optionsIfAvailable = {
	"standard": [/* currently none */],
	"extended": ["deviceShare", "listeningClock", "topArtists"],
	"technical": [/* currently none */]
};

const diagramClasses = {
	"deviceShare": DeviceShare,
	"listeningClock": ListeningClock,
	"topList": TopList
};

window.addEventListener("load", () => {
	let dataSelector = document.querySelector("#dataSelector");
	dataSelector.addEventListener("click", dataSelectorClicked);

	let diagramChooser = document.querySelector("#diagramChooser");
	diagramChooser.addEventListener("change", requestNewDiagram);

	currentChart = new Chart(document.querySelector("#chartCanvas"));
});

async function requestNewDiagram(e) {
	if (!e.isTrusted) {
		console.warn("requestNewDiagram dispatch not trusted.");
	}

	let diagramClass = diagramClasses[e.target.value];

	currentProcessor = await diagramClass.createProcessor(currentChart, dataFolder);
	await currentProcessor.drawChart();

	console.log(e);
	console.log(dataFolder);
}

async function dataSelectorClicked(e) {
	try {
		dataFolder = await window.showDirectoryPicker();
		e.target.style.backgroundColor = "#0F0";
	}
	catch (exception) {
		e.target.style.backgroundColor = "#F00";
		throw exception;
	}

	let diagramChooser = document.querySelector("#diagramChooser");
	let changeEvent = new Event("change");
	diagramChooser.dispatchEvent(changeEvent);
}