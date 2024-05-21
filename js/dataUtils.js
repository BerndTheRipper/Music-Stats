/**
 * Some static utilities for drawing data to the frontend that is not the canvas
 */
export default class DataUtils {
	/**
	 * Converts a list of strings to an HTML parent element with child elements containing the list contents.
	 * @param {Array} list The list of items that should be displayed
	 * @param {string} [parent="ol"] The type of element that the parent should be
	 * @param {string} [children="li"] The type of element that each of the children should be
	 * @returns {Element} The created element containing the list elements
	 * @throws {TypeError} When an incorrect type was provided
	 */
	static arrayToElement(list, parent = "ol", children = "li") {
		if (!(list instanceof Array)) {
			throw new TypeError("list must be an array.");
		}
		if (typeof parent != "string") {
			throw new TypeError("parent must be of type string");
		}
		if (typeof children != "string") {
			throw new TypeError("parent must be of type string");
		}
		let output = document.createElement(parent);
		for (let entry of list) {
			let child = document.createElement(children);
			child.innerText = entry;
			output.appendChild(child);
		}
		return output;
	}
}