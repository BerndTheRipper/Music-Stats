import Processor from "./processor.js"

/**
 * @class
 * @hideconstructor
 * @classdesc Draws a polar area chart that shows at what hour of the day I heard to how much music.
 * @extends Processor
 */
export default class ListeningClock extends Processor {
	timeAmounts = [];
	/**
	 * Don't use! Use [createProcessor]{@link ListeningClock.createProcessor} instead.
	 * @throws {SyntaxError} If this function gets called directly
	 */
	constructor() {
		super();
	}

	/**
	 * draws new polar area chart representing where I streamed how many songs
	 */
	async drawChart() {
		this.statsToShow = {};
		this._insertAddDataFunctionToObject(this.statsToShow);
		await this.readFiles();
		this.cleanupData();
		this.setUpChart();

		this.chart.update();
	}

	async readFiles() {
		//Filling in statsToShow so I don't have to check if it is already there on every iteration
		for (let i = 0; i < 24; i++) {
			this.statsToShow[i] = 0;
		}
		for await (const fileHandle of this.neededFolderHandle.values()) {
			if (!fileHandle.name.startsWith("endsong_")) continue;
			let file = await fileHandle.getFile();

			let entriesObject = JSON.parse(await file.text());

			this.readStats(entriesObject);
			// let statsObtained = this.readStats(entriesObject);
			// this.statsToShow.addData(statsObtained);
		}
	}

	readStats(dataObject) {
		let output = {};
		let totalStreams = dataObject.length;
		for (let entry of dataObject) {
			let timestampToUse = entry["ts"];
			if (entry["offline"]) {
				timestampToUse = entry["offline_timestamp"];
			}
			let dateObject = new Date(timestampToUse);
			if (!this._dateWithinTimeframe(dateObject)) continue;

			let hourToAdd = dateObject.getHours();
			if (entry.offline) {
				if (!entry.offline_timestamp) throw new Error("Something wrong? offline_timestamp should be set because entry.offline is true");
				hourToAdd = new Date(entry.offline_timestamp).getHours();
			}
			this.statsToShow[hourToAdd]++;
		}

		return output;
	}

	cleanupData() {
		delete this.statsToShow.addData;
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

		this.chart.config.type = "polarArea";
		this.chart.config.data = data;
	}

	/**
	 * Creates the processor
	 * @param {Chart} chart A pre-initialized chart object
	 * @param {FileSystemDirectoryHandle} folder The folder at the root of myData
	 * @throws {TypeError} if one of the parameters has an incorrect type
	 */
	static async createProcessor(chart, folder) {
		//Type validation is done in this function already
		let output = await super.createProcessor(chart, folder, "extended");

		return output;
	}
}