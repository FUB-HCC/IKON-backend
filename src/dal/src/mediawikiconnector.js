const bot = require('nodemw');

// pass configuration object


class MediaWikiConnector {
	constructor(botsecret) {
		try {
			this.client = new bot(botsecret)
			this.client.logIn((err, data) => console.log(err, data))
		}
		catch(e) {
			console.log(e)
		}
	}
}

module.exports = MediaWikiConnector