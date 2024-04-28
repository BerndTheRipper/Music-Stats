
/**
 * Indicates wether or not a file exists inside a folder
 * @param {FileSystemDirectoryHandle} folderHandle The folder to search for the object in
 * @param {string} filePath The path to look for. Currently only one folder followed by one file is supported
 * @throws {SyntaxError} If the file path consists of more than one folder and one file
 * @throws {TypeError} If a wrong type is being provided
 * @returns {boolean} true if the file exists, false if not
 */
export async function filePathExists(folderHandle, filePath) {
	let splitPath = filePath.split("/");
	if (splitPath.length > 2) {
		throw new SyntaxError("For the moment this function only supports file paths with a depth of 1");
	}

	if (!(folderHandle instanceof FileSystemDirectoryHandle)) {
		throw new TypeError("folderHandle must be of type FileSystemDirectoryHandle!");
	}

	if (typeof filePath != "string") {
		throw new TypeError("filePath must be of type string!");
	}

	fileNameIndex = 0;
	if (splitPath.length == 2) {
		if (splitPath[0] == folderHandle.name) {
			fileNameIndex = 1;
		}
		else {
			for await (const actualFolderHandle of folderHandle.values()) {
				if (!(actualFolderHandle instanceof FileSystemDirectoryHandle)) continue;
				if (actualFolderHandle.name != splitPath[0]) continue;
				return await filePathExists(actualFolderHandle, filePath);
			}
		}
	}

	for await (const fileHandle of folderHandle.values()) {
		if (!(fileHandle instanceof FileSystemFileHandle)) continue;
		if (fileHandle.name != splitPath[fileNameIndex]) continue;
		return true;
	}

	return false;
}