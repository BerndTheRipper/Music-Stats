const platformStarts = [
	"Windows 7",
	"Windows 10",
	"iOS",
	"web_player linux",
	"web_player windows 7;chrome",
	"web_player windows 10;chrome",
	"web_player windows 10;firefox",
	"web_player windows 10;microsoft edge",
	"web_player windows 10;opera"
];

function getStats(listoflists, summarizeBrowsers = true) {
	let devicesUsed = {};
	for (list of listoflists) {
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
	let output = { "devicesUsed": devicesUsed };
	return output;
}

function getPartialStats(original, summarizeBrowsers = true) {
	return getStats([original], summarizeBrowsers);
}