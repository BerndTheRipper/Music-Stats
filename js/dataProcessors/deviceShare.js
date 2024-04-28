import Processor from "./processor.js"

/**
 * @class
 * @hideconstructor
 * @classdesc Draws a pie chart that shows the share of devices that I streamed from over a global lifespan
 * @extends Processor
 * @todo figure out how to solve this issue with the await not being available in the constructor, maybe make the constructor static
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
		let totalStreams = dataObject.length;
		for (let entry of dataObject) {
			let platformToList = "Other";

			for (let starter of this.platformStarts) {
				if (!entry.platform.startsWith(starter)) continue;
				platformToList = starter;
				break;
			}

			if (!output[platformToList]) {
				output[platformToList] = 1;
				continue;
			}
			output[platformToList] += 1;
		}

		return output;
	}

	/**
	 * @todo move summarizing platforms here
	 */
	cleanupData() {
		if (this.platformStarts.length != this.platformLabels.length) {
			throw new Error("Platform starts and platform labels must be the same lengths.");
		}

		delete this.statsToShow.addData;

		for (let i in this.platformLabels) {
			if (this.platformStarts[i] == this.platformLabels[i]) continue;
			this.statsToShow[this.platformLabels[i]] = this.statsToShow[this.platformStarts[i]];
			delete this.statsToShow[this.platformStarts[i]];
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

	/**
	 * @param {Chart} chart A pre-initialized chart object
	 * @param {FileSystemDirectoryHandle} folder The folder at the root of myData
	 */
	static async createProcessor(chart, folder) {
		let output = await super.createProcessor(chart, folder, "extended");

		return output;
	}
}