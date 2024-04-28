/**
 * @class
 * @classdesc Base class for all the other processors
 */
export default class Processor {
	neededFolderHandle;
	statsToShow;
	/**
	 * Creates a new processor. This constructor makes type validations and 
	 * @param {Chart} chart The chart that should be drawn into
	 * @param {FileSystemDirectoryHandle} folder The folder to read the data from
	 * @param {string} neededFolder The name of the data folder that we need
	 * @throws {TypeError} if one of the parameters has an incorrect type
	 */
	constructor(chart, folder, neededFolder) {
		if (!(chart instanceof Chart)) {
			throw new TypeError("Chart parameter needs to be of type Chart (duh)");
		}

		if (!(folder instanceof FileSystemDirectoryHandle)) {
			throw new TypeError("folder needs to be of type FileSystemDirectoryHandle!");
		}

		if (typeof neededFolder != "string") {
			throw new TypeError("neededFolder needs to be of type string");
		}

		if (folder.name == neededFolder) {
			this.neededFolderHandle = folder;
		}
		else {
			for await (let folderHandle of folder.values()) {
				if (!(folderHandle instanceof FileSystemDirectoryHandle)) continue;
				if (folderHandle.name != neededFolder) continue;
				this.neededFolderHandle = folderHandle;
			}
		}
	}
}