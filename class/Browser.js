const puppeteer = require('puppeteer');

const numSentencePairs = 7;
const { wait } = require('../util');


class Browser {
	constructor (proxy) {
		let browser;
		let page;
		this.proxy = proxy;
	}

	async init () {
		console.log(this.proxy);
		this.browser = await puppeteer.launch({
			headless: false,
			// ignoreHTTPSErrors: true,
			// args: [
			// 	// `--proxy-server=${this.proxy}`,
			// 	`--proxy-server=67.60.137.219:35979`,
			// 	'--ignore-certificate-errors',
			// 	'--ignore-certificate-errors-spki-list'
			// ],
		});
		this.page = await this.browser.newPage();
		// await this.page.goto('https://spanishdict.com');
	}

	// inputs url
	async fetchSentences (url) {
		console.time('going to url')
		await this.page.goto(url, { waitUntil: 'load', timeout: 0 });

		// force wait 5 seconds, because sentences take a while to appear after dom loaded
		await wait(5000);
		console.timeEnd('going to url')
		console.log(url);


		const sentences = await this.page.evaluate(numSentencePairs => {
			console.log(document);

			const sents = Array.from(document.querySelectorAll('.translate .megaexamples-pair .megaexamples-pair-part'))
				.slice(0, numSentencePairs * 2)
				.map(node => node.innerText)
				.reduce((accum, sentence, index) => {
					if (index % 2 === 0) accum.push({ spanishSentence: sentence });
					else accum[accum.length - 1].englishSentence = sentence;
					return accum;
				}, []);

			return sents;
		}, numSentencePairs);

		return sentences;
	}
}

module.exports = Browser;
