window.addEventListener("load", () => {
	let extendedSelector = document.querySelector("#extendedSelector");
	extendedSelector.addEventListener("click", extendedSelectorClicked);
});

async function extendedSelectorClicked(e) {
	let folder;
	try {
		folder = await window.showDirectoryPicker();
		e.target.style.backgroundColor = "#0F0";
	}
	catch (e) {
		if (e instanceof DOMException) {
			e.target.style.backgroundColor = "#F00";
			return;
		}
	}

	let calculations = {
		addInHere: function (stuffToAdd) {
			for (let [key, value] of Object.entries(stuffToAdd)) {
				if (typeof value == "object") {
					if (!this[key]) {
						this[key] = { addInHere: this.addInHere };
					}
					this[key].addInHere(value);
				}
				else if (typeof value == "number") {
					if (!this[key]) {
						this[key] = value;
						continue;
					}
					this[key] += value;
				}
			}
		}
	};

	for await (const fileHandle of folder.values()) {
		if (!fileHandle.name.startsWith("endsong_")) continue;
		let file = await fileHandle.getFile();

		let entriesObject = JSON.parse(await file.text());

		let statsObtained = getPartialStats(entriesObject, true);
		calculations.addInHere(statsObtained);
	}

	let totalStreams = 0;

	for (let deviceStreams of Object.values(calculations["devicesUsed"])) {
		if (typeof deviceStreams != "number") continue;
		totalStreams += deviceStreams;
	}

	let newAddition = {
		"devicesUsedShare": {}
	};

	for (let [deviceName, deviceAmount] of Object.entries(calculations["devicesUsed"])) {
		newAddition["devicesUsedShare"][deviceName] = deviceAmount / totalStreams;
	}

	calculations.addInHere(newAddition);

	console.log(calculations);
}