/**
 * @class
 * @hideconstructor
 * @classdesc Base class for all the other processors
 */
export default class Processor {
	/**
	 * Gets set to true if the constructor is being called through justifiable means.
	 */
	static #initializing = false;
	/**
	 * The readily initialized chart
	 */
	chart;
	/**
	 * If the stats should not be shown as a chart, they can be put in this div instead
	 */
	dataDiv;
	/**
	 * The folder handle of the folder that contains the necessary files
	 */
	neededFolderHandle;
	/**
	 * @todo document this
	 */
	elementsForEventHandlers = {};
	/**
	 * An object that contains the stats that get shown on the chart
	 */
	statsToShow = {
		addData: function (stuffToAdd) {
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
	};

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
	 * @param {*} dataObject The object to be rad from. Objects are specified by descendents
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
	 * currently referenced in [TopList]
	 * @returns 
	 */
	getElementsForEventHandlers() {
		return this.elementsForEventHandlers;
	}

	/**
	 * 
	 * @param {*} e 
	 * @todo properly document, type verification, throws when unexpected event gets dispatched
	 */
	eventHandler(e) { }
	/**
	 * Creates a new processor. This constructor makes type validations and 
	 * @param {Chart} chart The chart that should be drawn into
	 * @param {FileSystemDirectoryHandle} folder The folder to read the data from
	 * @param {string} neededFolder The name of the data folder that we need
	 * @param {null} [dataDiv=null] The div that will cotain further information on the stats, or maybe even the stats themselves
	 * @param {boolean} [showChart=true] Whether or not a chart should be shown
	 * @throws {TypeError} if one of the parameters has an incorrect type
	 */
	static async createProcessor(chart, folder, neededFolder, dataDiv = null, showChart = true) {
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

		return output;
	}
}