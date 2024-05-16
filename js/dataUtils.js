/**
 * @todo add proper documentation and fix list not showing proper numbering
 */
export default class DataUtils {
	static arrayToElement(list, parent = "ol", children = "li") {
		let output = document.createElement(parent);
		for (let entry of list) {
			let child = document.createElement(children);
			child.innerText = entry;
			output.appendChild(child);
		}
		return output;
	}
}