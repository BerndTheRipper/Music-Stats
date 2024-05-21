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

/**
 * Handles a new diagram being requested. This usually gets triggered when a new statistic is set to be shown 
 * @param {Event} e The event info from the submit event
 * @throws {TypeError} If e is not an event of type change
 */
async function requestNewDiagram(e) {
	if (!(e instanceof Event) || e.type != "change") {
		throw new TypeError("e needs to be a change event");
	}
	if (!e.isTrusted) {
		console.warn("requestNewDiagram dispatch not trusted.");
	}

	let diagramClass = diagramClasses[e.target.value];

	currentProcessor = await diagramClass.createProcessor(currentChart, dataFolder);
	await currentProcessor.drawChart();

	let eventHandlingNeeders = currentProcessor.getElementsForEventHandlers();

	//TODO add type validation that each value is an array and each array entry is an element
	for (let eventType of Object.keys(eventHandlingNeeders)) {
		for (let element of eventHandlingNeeders[eventType]) {
			element.addEventListener(eventType, eventPasser);
		}
	}

	console.log(e);
	console.log(dataFolder);
}

/**
 * When the button to select the data was clicked.
 * @param {PointerEvent} e The information about the event that was dispatched
 * @throws {TypeError} If e is not a PointerEvent of type click
 */
async function dataSelectorClicked(e) {
	if (!(e instanceof PointerEvent) || e.type != "click") {
		throw new TypeError("e needs to be a change event");
	}
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

function eventPasser(e) {
	currentProcessor.eventHandler(e);
}