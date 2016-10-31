exports.config = {
	/**
	 * @see @link https://github.com/SeleniumHQ/selenium/blob/master/java/CHANGELOG
	 * @see @link http://stackoverflow.com/questions/25743869/how-can-i-configure-the-firefox-binary-location-in-protractor
	 * @see @link https://github.com/angular/protractor/blob/master/lib/config.ts
	 */
	allScriptsTimeout : 11000,

	specs : [
		'*.js'
	],

	capabilities : {
		'browserName' : 'firefox',
		'firefox_binary' : '/usr/bin/firefox-45.4.0esr',
		'binary_' : '/usr/bin/firefox-45.4.0esr'
	},

	baseUrl : 'http://127.0.0.1:8000/app/',

	framework : 'jasmine',

	jasmineNodeOpts : {
		defaultTimeoutInterval : 30000
	}
};