class Oauth {
	authenticationURL;
	clientID;
	clientSecret;
	redirectURL;
	responseType;
	scope;
	#codeChallengeMethod = "S256";
	#randomString;
	#codeChallenge;
	state;

	/**
	 * 
	 */
	constructor(appName = null, authenticationURL = null, clientID = null, clientSecret = null, redirectURL = null, state = null) {
		this.#randomString = Oauth.generateRandomString(128);
		//TODO figure out making this async, another createOauth thing? or making a function to set it to PKCE?
		let hashed = Oauth.generateHash(randomString);
		this.#codeChallenge = Oauth.base64Encode(hashed);

		if (appName == "spotify") {
			//TODO make this a prefab that only gets iterated through
			this.authenticationURL = "https://accounts.spotify.com/authorize";
			this.clientID = "TBD";
			this.redirectURL = location.origin + "/oAuthCallback";
			this.responseType = "code";
			//TODO check if this scope allows the creation of a private playlist
			this.scope = "playlist-modify-public";
			this.state = state;
		}
	}

	static generateRandomString(length) {
		let output = "";

		let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.-~";
		let array = new Uint8Array(length);

		crypto.getRandomValues(array);
		for (let value of array) {
			output += possible[value % possible.length];
		}

		return output;
	}

	static async generateHash(plainText) {
		let encoder = new TextEncoder();
		let encoded = encoder.encode(plainText);
		return window.crypto.subtle.digest("SHA-256", encoded);
	}

	static base64Encode(input) {
		//TODO write function
		let output = window.btoa(input);
		output = output.replace("=", "");
		output = output.replace("+", "-");
		output = output.replace("/", "_");

		return output;
	}
}