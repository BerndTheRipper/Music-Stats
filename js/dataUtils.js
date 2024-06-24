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
			throw new TypeError("child must be of type string");
		}
		let output = document.createElement(parent);
		for (let entry of list) {
			let child = document.createElement(children);
			child.innerText = entry;
			output.appendChild(child);
		}
		return output;
	}

	/**
	* Processes an input to a date object. If the input is a string that can be resolved to a Date object, such a date object is returned. If a date object is provided, the date object is returned. If anything else is provided, the output is null.
	* @param {Date|string|int} input The input that is to be processed
	* @returns {Date|null} The resolved date or a null, if processing fails
	*/
	static dateInputProcessor(input) {
		if (input instanceof Date) {
			if (isNaN(input.getTime())) {
				return null;
			}
			return input;
		}
		if (input == null) return null;
		let dateObject = new Date(input);
		if (isNaN(dateObject.getTime())) return null;
		return dateObject;
	}
}