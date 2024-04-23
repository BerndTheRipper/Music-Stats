const platformStarts = [
	"Windows 7",
	"Windows 10",
	"iOS",
	"Android OS",
	"Android-tablet",
	"web_player android",
	"web_player linux",
	"web_player windows 7;chrome",
	"web_player windows 10;chrome",
	"web_player windows 10;firefox",
	"web_player windows 10;microsoft edge",
	"web_player windows 10;opera"
];

function getStats(listoflists, summarizeBrowsers = true) {
	let devicesUsed = {};
	let totalStreams = 0;
	for (list of listoflists) {
		totalStreams += list.length;
		for (entry of list) {
			let platformToList = entry.platform;

			if (summarizeBrowsers) {
				for (starter of platformStarts) {
					if (entry.platform.startsWith(starter)) {
						platformToList = starter;
						break;
					}
				}
			}

			if (!devicesUsed[platformToList]) {
				devicesUsed[platformToList] = 1;
				continue;
			}
			devicesUsed[platformToList]++;
		}
	}
	console.log(totalStreams);

	let output = { "devicesUsed": devicesUsed };

	// output["devicesUsedShare"] = {};
	// for (let [deviceType, amount] of Object.entries(output["devicesUsed"])) {
	// 	output["devicesUsedShare"][deviceType] = amount / totalStreams;
	// }

	return output;
}

function getPartialStats(original, summarizeBrowsers = true) {
	return getStats([original], summarizeBrowsers);
}