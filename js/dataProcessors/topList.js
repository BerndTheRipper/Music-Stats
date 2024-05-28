import DataUtils from "../dataUtils.js";
import Processor from "./processor.js";

/**
 * @class
 * @hideconstructor
 * @classdesc Displays a list of the top n of either listened to artists or tracks by amount of streams within a given amount of time
 * @extends Processor
 * @todo maybe add toplist combined, and how big is the percentage the top list has
 * @todo add fuse against requesting more entries than there is data (might already have that?) check my 2022 data, if I really only listened to 26 unique artists after 01.01.2022. what exactly is the latest date here?
 * @todo maybe add by listening time
 */
export default class TopList extends Processor {
	//Possible values: album_artist, tracks
	//Currently supported: neither
	#whatToGet = "album_artist";
	#howMany = 10;
	//Within the top #howMany, this list is sorted, after that it is not
	#topList = [];
	data = {};


	/**
	 * what to get, whether the top artists or tracks should be obtained
	 * @returns {string} What should be gotten
	 */
	get whatToGet() {
		return this.#whatToGet;
	}

	/**
	 * Sets what to get, either top artists or tracks
	 * @todo add validation
	 */
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
		this.data = {};
		let keyString = "master_metadata_" + this.whatToGet + "_name";
		for (let entry of dataObject) {
			//If it's a podcast, it gets skipped for now
			if (entry["spotify_episode_uri"] != null || entry["spotify_track_uri"] == null) {
				continue;
			}
			let timestampToUse = entry["ts"];
			if (entry["offline"]) {
				timestampToUse = entry["offline_timestamp"];
			}

			let dateObject = new Date(timestampToUse);

			if (this._startingTime != null && dateObject.getTime() < this._startingTime.getTime()) {
				continue;
			}

			if (this._endingTime != null && dateObject.getTime() >= this._endingTime.getTime()) {
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
		this.#topList = [];
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

		this.statsToShow = {};
		for (let key of this.#topList) {
			this.statsToShow[key] = this.data[key];
		}
	}

	setUpChart() {
		let stringArray = [];
		//TODO make this adapt to this.#howMany
		let ol = this.dataDiv.querySelector("ol");
		if (ol != null) {
			this.dataDiv.removeChild(ol);
		}
		for (let [key, value] of Object.entries(this.statsToShow)) {
			stringArray.push(key + ": " + value);
		}
		this.dataDiv.appendChild(DataUtils.arrayToElement(stringArray, "ol", "li"));
	}

	//Currently only gets called for a new amount on the top list
	//TODO make it work and make it work for all
	eventHandler(e) {
		if (e.type == "submit") {
			e.preventDefault();
			return;
		}

		if (e.type != "change" && e.type != "submit") throw new Error("Unexpected event.");

		if (e.target.name == "howMany") {
			let newAmount = e.target.value;
			this.#howMany = parseInt(newAmount);
		}
		else if (e.target.type == "date") {
			let chosenDate = new Date(e.target.value);
			if (isNaN(chosenDate.getDate())) chosenDate = null;
			if (e.target.name == "startTime") {
				this._startingTime = chosenDate;
			}
			else if (e.target.name == "endTime") {
				this._endingTime = chosenDate;
			}
		}

		this.drawChart();
		return;
	}

	/**
	 * Creates the processor
	 * @param {Chart} chart A pre-initialized chart object
	 * @param {FileSystemDirectoryHandle} folder The folder at the root of myData
	 * @throws {TypeError} if one of the parameters has an incorrect type
	 * @todo obtain dataDiv through parameter
	 */
	static async createProcessor(chart, folder) {
		//Type validation is done in this function already
		let output = await super.createProcessor(chart, folder, "extended", document.querySelector("#dataDiv"), false);

		let form = document.createElement("form");
		let amountChooser = document.createElement("input");
		amountChooser.type = "number";
		amountChooser.min = 1;
		amountChooser.name = "howMany";
		amountChooser.placeholder = "How many?"
		form.appendChild(amountChooser);

		dataDiv.appendChild(form);
		output.elementsForEventHandlers["change"] = [amountChooser];
		output.elementsForEventHandlers["submit"] = [form];

		delete output.statsToShow.addData;
		return output;
	}
}