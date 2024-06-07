import DataUtils from "../dataUtils.js";

/**
 * @class
 * @hideconstructor
 * @classdesc Base class for all the other processors
 */
export default class Processor {
	/**
	 * @todo add types to all of these (why haven't I done this before?)
	 */
	/**
	 * Gets set to true if the constructor is being called through justifiable means.
	 */
	static #initializing = false;
	/**
	 * The readily initialized chart
	 */
	chart;
	/**
	 * The div that contains the controls that are specific to this chart, for example the chooser between percent and absolute amounts on the 
	 */
	chartSpecificControlDiv;
	/**
	 * If the stats should not be shown as a chart, they can be put in this div instead
	 */
	dataDiv;
	/**
	 * The folder handle of the folder that contains the necessary files
	 */
	neededFolderHandle;
	/**
	 * Elements that should get event handlers. The key is a string representing a type of event, e.g. "change" or "submit". The value represents an array of nodes that should have this event handler applied to them. The applying is done in the start.js file.
	 * See {@link Processor.eventHandler} for why I do it this way.
	 */
	elementsForEventHandlers = {};
	/**
	 * An object that contains the stats that get shown on the chart
	 */
	statsToShow = {};

	//If these two are unset the start and end time can be anything
	//startingtime <= time < endingTime
	/**
	 * The starting time for the inclusion of the stats in the chart.
	 */
	_startingTime = null;
	/**
	 * The ending time for the inclusion of the stats in the chart.
	 */
	_endingTime = null;

	get startingTime() {
		return this._startingTime;
	}

	setStartingTime(newValue, redrawChart = true) {
		if (this._startingTime == newValue) return;

		let processedDate = DataUtils.dateInputProcessor(newValue);

		if (this._startingTime == null && processedDate == null) return;
		if (this._startingTime != null && processedDate != null && this._startingTime.getTime() == processedDate.getTime()) return;

		this._startingTime = processedDate;
		if (redrawChart) this.drawChart();
	}

	get endingTime() {
		return this._endingTime;
	}

	setEndingTime(newValue, redrawChart = true) {
		if (this._endingTime == newValue) return;

		let processedDate = DataUtils.dateInputProcessor(newValue);

		if (this._endingTime == null && processedDate == null) return;
		if (this._endingTime != null && processedDate != null && this._endingTime.getTime() == processedDate.getTime()) return;

		this._endingTime = processedDate;
		if (redrawChart) this.drawChart();
	}

	constructor() {
		if (!Processor.#initializing) {
			throw new SyntaxError("This constructor is private. Please use createProcessor instead.");
		}
		Processor.#initializing = false;
	}

	/**
	 * @abstract
	 * Draws the chart
	 */
	async drawChart() { }

	/**
	 * @abstract
	 * reads the data from the files and provides data as object to [readStats]{@link Processor#readStats}
	 */
	async readFiles() { }

	/**
	 * @abstract
	 * reads the needed stats from the object provided
	 * @param {*} dataObject The object to be read from. Objects are specified by descendents
	 */
	readStats(dataObject) { }

	/**
	 * @abstract
	 * Cleans up the data so it looks nicer on the chart
	 */
	cleanupData() { }

	/**
	 * @abstract
	 * changes the settings of the chart so that it will show our diagram. It does not make the chart update tho!
	 */
	setUpChart() { }

	/**
	 * Clears chart content
	 */
	clearChartConfig() {
		this.chart.config.type = "";
		this.chart.config.data = {};
		this.chart.config.options = {};
		// this.chart.config.plugins = [];
	}

	/**
	 * Returns the elements that should have an event handler applied to them.
	 * @returns {Object} containing the event type that is to be handled as a key and an array with the nodes to be handled as a value.
	 */
	getElementsForEventHandlers() {
		return this.elementsForEventHandlers;
	}

	/**
	 * Handles any events that are dispatched because of the processor, for example the amount chooser in {@link TopList}.
	 * This function gets called from start.js instead of from the node at which the event was dispatched so I can have the this-object be the current processor instance instead of the node that dispatched the event.
	 * @abstract
	 * @param {Event} e data about the event
	 * @throws {Error} When you submit an unexpected event
	 */
	eventHandler(e) { }

	/**
	 * Determines wether or not the input is within the date area
	 * @param {Date|string|int} input The date that is to be verified
	 * @returns Wether or not it is within the starting and ending time
	 * @throws {TypeError} When the input does not resolve to a date.
	 */
	_dateWithinTimeframe(input) {
		if (this._startingTime == this._endingTime && this._endingTime == null) return true;
		let dateObject = DataUtils.dateInputProcessor(input);
		if (dateObject == null) throw new TypeError("Input does not resolve to a Date object.");

		//Not to self because I was wondering about it: I retain the check if this._startTime is null  because the beginning condition only stops the programme if both this._startTime and this._endTime are null, not if only one of them is.
		if (this._startingTime != null && dateObject.getTime() < this._startingTime.getTime()) {
			return false;
		}

		if (this._endingTime != null && dateObject.getTime() >= this._endingTime.getTime()) {
			return false;
		}

		return true;
	}

	//TODO recursive addData remover
	/**
	 * Adds an addData function to an object
	 * @param {Object} object The object that should get the addData function (normally this.statsToShow)
	 * @todo This is not the problem, the problem is this getting called in too quick succession, making one redraw interfere with the other. Needs fixing that I can't do before midnight.
	 * @throws {TypeError} If called with something other than an object.
	 */
	_insertAddDataFunctionToObject(object) {
		if (typeof object != "object") throw new TypeError("The provided object is not actually an object.");
		object["addData"] = function (stuffToAdd) {
			for (let [key, value] of Object.entries(stuffToAdd)) {
				if (typeof value == "object") {
					if (!this[key]) {
						this[key] = { addData: this.addData };
					}
					this[key].addData(value);
				}
				else if (typeof value == "number") {
					if (!this[key]) {
						this[key] = value;
						continue;
					}
					this[key] += value;
				}
			}
		}
	}

	/**
	 * Creates a new processor. This constructor makes type validations and sets up all the internal variables such as the needed folder or wether or not to show the chart.
	 * @todo take into account already entered times for this
	 * @param {Chart} chart The chart that should be drawn into
	 * @param {FileSystemDirectoryHandle} folder The folder to read the data from
	 * @param {string} neededFolder The name of the data folder that we need
	 * @param {Element|null} [dataDiv=null] The div that will cotain further information on the stats, or maybe even the stats themselves
	 * @param {boolean} [showChart=true] Whether or not a chart should be shown
	 * @param {Element|null} [chartSpecificControlDiv=null] The chart controls like the swither from percent or stream amount
	 * @throws {TypeError} if one of the parameters has an incorrect type
	 */
	static async createProcessor(chart, folder, neededFolder, dataDiv = null, showChart = true, chartSpecificControlDiv = null) {
		if (!(chart instanceof Chart)) {
			throw new TypeError("Chart parameter needs to be of type Chart (duh)");
		}

		if (!(folder instanceof FileSystemDirectoryHandle)) {
			throw new TypeError("folder needs to be of type FileSystemDirectoryHandle!");
		}

		if (typeof neededFolder != "string") {
			throw new TypeError("neededFolder needs to be of type string");
		}
		if (dataDiv != null && !(dataDiv instanceof Element)) {
			throw new TypeError("If you want to give a dataDiv, it needs to be an Element.");
		}

		Processor.#initializing = true;
		let output = new this();
		output.chart = chart;

		if (folder.name == neededFolder) {
			output.neededFolderHandle = folder;
		}
		else {
			for await (let folderHandle of folder.values()) {
				if (!(folderHandle instanceof FileSystemDirectoryHandle)) continue;
				if (folderHandle.name != neededFolder) continue;
				output.neededFolderHandle = folderHandle;
				break;
			}
		}

		if (!(output.neededFolderHandle instanceof FileSystemDirectoryHandle)) {
			throw new ReferenceError("Could not find the needed folder")
		}
		output.clearChartConfig();

		if (showChart) {
			chart.canvas.style.display = "block";
		} else {
			chart.canvas.style.display = "none";
		}

		if (dataDiv != null) {
			dataDiv.innerHTML = "";
			output.dataDiv = dataDiv;
		}

		if (chartSpecificControlDiv != null) {
			chartSpecificControlDiv.innerHTML = "";
			output.chartSpecificControlDiv = chartSpecificControlDiv;
		}

		return output;
	}
}