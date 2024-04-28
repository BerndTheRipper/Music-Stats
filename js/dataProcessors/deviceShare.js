import Processor from "./processor.js"

/**
 * @class
 * @classdesc Draws a pie chart that shows the share of devices that I streamed from over a global lifespan
 * @extends Processor
 * @todo figure out how to solve this issue with the await not being available in the constructor, maybe make the constructor static
 */
export default class DeviceShare extends Processor {
	/**
	 * 
	 * @param {Chart} chart A pre-initialized chart object
	 * @param {FileSystemDirectoryHandle} folder The folder at the root of myData
	 */
	constructor(chart, folder) {
		super(chart, folder, "extended");
		// for await (const fileHandle of this.neededFolderHandle.values()) {
		// 	if (!fileHandle.name.startsWith("endsong_")) continue;
		// 	let file = await fileHandle.getFile();

		// 	let entriesObject = JSON.parse(await file.text());

		// 	let statsObtained = getPartialStats(entriesObject, true);
		// 	calculations.addInHere(statsObtained);
		// }
	}
}