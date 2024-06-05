import Processor from "./processor.js"

/**
 * @class
 * @hideconstructor
 * @classdesc Draws a pie chart that shows the share of devices that I streamed from over a global lifespan
 * @extends Processor
 */
export default class DeviceShare extends Processor {
	platformStarts = [
		"Other",
		"Windows",
		"iOS",
		"Android OS",
		"Android-tablet",
		"web_player windows"
	];
	platformLabels = [
		"Other",
		"Windows in-app",
		"iOS",
		"Android OS",
		"Android-tablet",
		"Browser windows"
	];
	totalStreams = 0;
	showAsPercentage = true;
	/**
	 * Don't use! Use [createProcessor]{@link DeviceShare.createProcessor} instead.
	 * @throws {SyntaxError} If this function gets called directly
	 */
	constructor() {
		super();
	}

	/**
	 * draws new pie chart representing where I streamed how many songs
	 */
	async drawChart() {
		this.statsToShow = {};
		this.totalStreams = 0;

		this._insertAddDataFunctionToObject(this.statsToShow);
		await this.readFiles();
		this.cleanupData();
		this.setUpChart();

		this.chart.update();
	}

	async readFiles() {
		for await (const fileHandle of this.neededFolderHandle.values()) {
			if (!fileHandle.name.startsWith("endsong_")) continue;
			let file = await fileHandle.getFile();

			let entriesObject = JSON.parse(await file.text());

			let statsObtained = this.readStats(entriesObject);
			this.statsToShow.addData(statsObtained);
		}
	}

	readStats(dataObject) {
		let output = {};
		this.totalStreams += dataObject.length;
		for (let entry of dataObject) {
			let timestampToUse = entry["ts"];
			if (entry["offline"]) {
				timestampToUse = entry["offline_timestamp"];
			}
			if (!this._dateWithinTimeframe(timestampToUse)) continue;

			let platformToList = entry.platform;

			if (!output[platformToList]) {
				output[platformToList] = 1;
				continue;
			}
			output[platformToList] += 1;
		}

		return output;
	}

	cleanupData() {
		if (this.platformStarts.length != this.platformLabels.length) {
			throw new Error("Platform starts and platform labels must be the same lengths.");
		}

		delete this.statsToShow.addData;

		for (let key of Object.keys(this.statsToShow)) {
			let statsSection = "Other";
			for (let i in this.platformStarts) {
				if (!key.startsWith(this.platformStarts[i])) continue;
				statsSection = this.platformLabels[i];
				break;
			}

			if (!this.statsToShow[statsSection]) this.statsToShow[statsSection] = 0;
			this.statsToShow[statsSection] += this.statsToShow[key];
			delete this.statsToShow[key];
		}

		if (this.showAsPercentage) {
			for (let key of Object.keys(this.statsToShow)) {
				this.statsToShow[key] = this.statsToShow[key] / this.totalStreams * 100;
			}
		}
	}

	setUpChart() {
		let data = {
			labels: Object.keys(this.statsToShow),
			datasets: [
				{
					label: "dataset 1",
					data: Object.values(this.statsToShow),
				}
			]
		}

		this.chart.config.type = "pie";
		this.chart.config.data = data;
	}

	eventHandler(e) {
		if (!(e instanceof PointerEvent)) throw new TypeError("e is not a pointer event");
		this.showAsPercentage = !this.showAsPercentage;
		this.updatePercentageButton(e.target);
	}

	updatePercentageButton(button) {
		if (this.showAsPercentage) {
			button.innerText = "In Prozent anzeigen";
		}
		else {
			button.innerText = "In Streams anzeigen";
		}
	}

	/**
	 * Creates the processor
	 * @param {Chart} chart A pre-initialized chart object
	 * @param {FileSystemDirectoryHandle} folder The folder at the root of myData
	 * @throws {TypeError} if one of the parameters has an incorrect type
	 */
	static async createProcessor(chart, folder) {

		//Type validation is done in this function already
		//TODO get controls through parameters
		let output = await super.createProcessor(chart, folder, "extended", null, true, document.querySelector("#chartSpecificControls"));

		let percentButton = document.createElement("button");
		output.elementsForEventHandlers = {
			"click": [percentButton]
		};
		output.updatePercentageButton(percentButton);
		output.chartSpecificControlDiv.appendChild(percentButton);

		return output;
	}
}