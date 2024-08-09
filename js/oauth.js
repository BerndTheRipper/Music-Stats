class Oauth {
	//Possible: PKCE, code
	//Supported: PKCE
	method = "PKCE";
	authenticationURL;
	clientID;
	clientSecret;
	redirectURL;
	responseType;
	scope;
	state;

	//PKCE stuff
	//TODO make the hashing algorithm take into account this value, but make sure that it also stays compatible as a URL parameter
	#codeChallengeMethod = "S256";
	#randomString;
	#codeChallenge;

	/**
	 * 
	 */
	constructor(appName = null, authenticationURL = null, clientID = null, clientSecret = null, redirectURL = null, state = null) {
		this.#randomString = Oauth.generateRandomString(128);
		//TODO figure out making this async, another createOauth thing? or making a function to set it to PKCE?
		let hashed = Oauth.generateHash(this.#randomString);
		this.#codeChallenge = Oauth.base64Encode(hashed);

		if (appName == "spotify") {
			//TODO make this a prefab that only gets iterated through
			this.authenticationURL = "https://accounts.spotify.com/authorize";
			this.clientID = "455c1cdb754d46a8885da85ee59af2af";
			this.redirectURL = location.origin + "/oAuthCallback";
			this.responseType = "code";
			//TODO check if this scope allows the creation of a private playlist
			this.scope = "playlist-modify-public";
			this.state = state;
		}
	}

	login() {

	}

	displayLoginWindow() {

	}

	getSearchParams() {
		let paramObject = {
			client_id: this.clientID,
			response_type: this.method,
			redirect_uri: this.redirectURL,
			state: this.state,
			scope: this.scope
		};

		if (this.method == "PKCE") {
			if (this.#randomString == null || this.#codeChallenge == null) throw new Error("If the method is set to PKCE, the challenge needs to have been generated before calling getSearchParams");

			paramObject.response_type = "code";
			paramObject.code_challenge_method = this.#codeChallengeMethod;
			paramObject.code_challenge = this.#codeChallenge;
		}

		return new URLSearchParams(paramObject);
	}

	async #generatePKCEChallenge(length = 64) {
		this.#randomString = Oauth.generateRandomString(length);
		let hashed = await Oauth.generateHash(this.#randomString);
		this.#codeChallenge = Oauth.base64Encode(hashed);
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
		let output = window.btoa(String.fromCharCode(...new Uint8Array(input)));
		output = output.replaceAll("=", "");
		output = output.replaceAll("+", "-");
		output = output.replaceAll("/", "_");

		return output;
	}
}