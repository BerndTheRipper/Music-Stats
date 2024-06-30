import DeviceShare from "./dataProcessors/deviceShare.js"
import ListeningClock from "./dataProcessors/listeningClock.js";
import TopList from "./dataProcessors/topList.js";
import DataUtils from "./dataUtils.js";

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

	let startTime = document.querySelector("#startTime");
	startTime.addEventListener("focusout", timeEdgesUnfocused);

	let endTime = document.querySelector("#endTime");
	endTime.addEventListener("focusout", timeEdgesUnfocused);

	let clockSwitcher = document.querySelector("#clockSwitcher");
	clockSwitcher.addEventListener("click", clockSwitcherClicked);

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

	document.querySelector("#chartSpecificControls").innerHTML = "";

	let diagramClass = diagramClasses[e.target.value];

	if (currentProcessor != null) {
		currentProcessor.clearChartConfig();
	}
	currentProcessor = await diagramClass.createProcessor(currentChart, dataFolder);
	await currentProcessor.drawChart();

	let eventHandlingNeeders = currentProcessor.getElementsForEventHandlers();

	for (let eventType of Object.keys(eventHandlingNeeders)) {
		for (let element of eventHandlingNeeders[eventType]) {
			if (!(element instanceof Element)) throw new Error("One of the values in the eventHandlingNeeders is not an element.");
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

/**
 * Handles the changing of the timeEdges
 * @param {Event} e Information about the dispatching of the event.
 */
async function timeEdgesUnfocused(e) {
	if (!(e instanceof FocusEvent)) throw new TypeError("Invalid event provided");

	if (currentProcessor == null) return;
	let startingTimeElement = document.querySelector("#startTime");
	let endingTimeElement = document.querySelector("#endTime");
	if (e.relatedTarget == startingTimeElement || e.relatedTarget == endingTimeElement) return;

	let userStartingTime = DataUtils.dateInputProcessor(startingTimeElement.value);
	let userEndingTime = DataUtils.dateInputProcessor(endingTimeElement.value);
	let redrawNeeded = false;

	if (
		(
			(
				userStartingTime == null ||
				currentProcessor.startingTime == null
			) &&
			userStartingTime != currentProcessor.startingTime
		) ||
		(
			userStartingTime instanceof Date &&
			currentProcessor.startingTime instanceof Date &&
			userStartingTime.getTime() != currentProcessor.startingTime.getTime()
		)
	) {
		currentProcessor.setStartingTime(userStartingTime, false);
		redrawNeeded = true;
	}
	if (
		(
			(
				userEndingTime == null ||
				currentProcessor.endingTime == null
			) &&
			userEndingTime != currentProcessor.endingTime
		) ||
		(
			userEndingTime instanceof Date &&
			currentProcessor.endingTime instanceof Date &&
			userEndingTime.getTime() != currentProcessor.endingTime.getTime()
		)
	) {
		currentProcessor.setEndingTime(userEndingTime, false);
		redrawNeeded = true;
	}

	if (redrawNeeded) {
		startingTimeElement.disabled = true;
		endingTimeElement.disabled = true;
		await currentProcessor.drawChart();
		startingTimeElement.disabled = false;
		endingTimeElement.disabled = false;
	}
}

/**
 * Handles it when the time specification button is clicked and will either activate specifyying a time or deactivate it.
 * @param {PointerEvent} e The data associated to the click event
 * @throws {TypeError} if e is not a PointerEvent
 */
function clockSwitcherClicked(e) {
	if (!(e instanceof PointerEvent)) throw new TypeError("Invalid event provided");
	let startTime = document.querySelector("#startTime");
	let endTime = document.querySelector("#endTime");

	if (startTime.type != endTime.type) throw new Error("The page seems corrupted. Try reloading it.");
	if (startTime.type == "date") {
		startTime.type = "datetime-local";
		endTime.type = "datetime-local";
		e.target.innerText = "Ohne Uhrzeit";
	}
	else {
		startTime.type = "date";
		endTime.type = "date";
		e.target.innerText = "Mit Uhrzeit";
	}
}

/**
 * If an event from a processor element gets dispatched, it will be passed on to the processor here. The handler is not called directly so that within the handler, "this" will represent the current Processor object instead of the node dispatching the event.
 * @param {Event} e The information about the event (will be passed on to the current processor)
 */
function eventPasser(e) {
	currentProcessor.eventHandler(e);
}