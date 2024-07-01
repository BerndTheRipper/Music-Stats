import Processor from "./processor";

/**
 * Template class containing the most basic functions, even more basic than processor.js
 * @hideconstructor
 */
class Template extends Processor {
	constructor() {
		super();
	}

	async drawChart() {

	}

	async readFiles() {

	}

	readStats(dataObject) {

	}

	cleanupData() {

	}

	setUpChart() {

	}

	static async createProcessor(chart, folder) {
		// let output = await super.createProcessor();
	}
}