import DataUtils from "../dataUtils.js";
import Processor from "./processor.js";

export default class TopList extends Processor {
	//Possible values: album_artist, tracks
	//Currently supported: neither
	#whatToGet = "album_artist";
	#howMany = 10;
	//Within the top #howMany, this list is sorted, after that it is not
	#topList = [];
	data = {};

	//If these two are unset the start and end time can be anything
	//startingtime <= time < endingTime
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
		for await (const fileHandle of this.neededFolderHandle.values()) {
			if (!fileHandle.name.startsWith("endsong_")) continue;
			let file = await fileHandle.getFile();

			let entriesObject = JSON.parse(await file.text());


			let statsObtained = this.readStats(entriesObject);
			// this.statsToShow.addData(statsObtained);
		}
	}

	readStats(dataObject) {
		for (let entry of dataObject) {
			let timestampToUse = entry["ts"];
			let keyString = "master_metadata_" + this.whatToGet + "_name";
			if (entry["offline"]) {
				timestampToUse = entry["offline_timestamp"];
			}

			let dateObject = new Date(timestampToUse);

			if (this.#startingTime != null && dateObject.getTime() < this.#startingTime.getTime()) {
				continue;
			}

			if (this.#endingTime != null && dateObject.getTime() >= this.#endingTime.getTime()) {
				continue;
			}

			if (!this.data[entry[keyString]]) {
				this.data[entry[keyString]] = 1;
				continue;
			}
			this.data[entry[keyString]] += 1;
		}
	}

	cleanupData() {
		let keys = Object.keys(this.data);
		let values = Object.values(this.data);
		this.#topList[0] = keys[0];

		for (let i = 1; i < keys.length; i++) {
			for (let k = 0; k < keys.length && k < this.#howMany; k++) {
				if (this.#topList[k] == null) {
					this.#topList[k] = keys[i];
					continue;
				}
				if (values[i] <= this.data[this.#topList[k]]) continue;
				this.#topList[this.#howMany - 1] = keys[i];
				for (let j = this.#howMany - 1; j > k; j--) {
					let temp = this.#topList[j - 1];
					this.#topList[j - 1] = this.#topList[j];
					this.#topList[j] = temp;
				}
				break;
			}
		}

		for (let key of this.#topList) {
			this.statsToShow[key] = this.data[key];
		}
	}

	setUpChart() {
		let stringArray = [];
		delete this.statsToShow.addData;
		for (let [key, value] of Object.entries(this.statsToShow)) {
			stringArray.push(key + ": " + value);
		}
		this.dataDiv.appendChild(DataUtils.arrayToElement(stringArray, "ol", "ul"));
	}

	/**
	 * @param {Chart} chart A pre-initialized chart object
	 * @param {FileSystemDirectoryHandle} folder The folder at the root of myData
	 * @todo obtain dataDiv through parameter
	 */
	static async createProcessor(chart, folder) {
		let output = await super.createProcessor(chart, folder, "extended", document.querySelector("#dataDiv"));

		return output;
	}
}