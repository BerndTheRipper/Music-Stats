import Processor from "./processor.js";

export default class TopList extends Processor {
	//Possible values: artists, tracks
	//Currently supported: neither
	#whatToGet = "artists";

	//If these two are unset the start and end time can be anything
	#startingTime = null;
	#endingTime = null;

	get whatToGet() {
		return this.#whatToGet;
	}

	set whatToGet(value) {
		this.#whatToGet = value;
	}

	constructor() {
		super();
	}

	async drawChart() {
		await this.readFiles();
		this.cleanupData();
		this.setUpChart();

		this.chart.update();
	}

	async readFiles() {
		for (let i = 0; i < 24; i++) {
			this.statsToShow[i] = 0;
		}
		for await (const fileHandle of this.neededFolderHandle.values()) {
			if (!fileHandle.name.startsWith("endsong_")) continue;
			let file = await fileHandle.getFile();

			let entriesObject = JSON.parse(await file.text());


			let statsObtained = this.readStats(entriesObject);
			// this.statsToShow.addData(statsObtained);
		}
	}

	readStats(dataObject) {

	}

	cleanupData() {

	}

	setUpChart() {

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