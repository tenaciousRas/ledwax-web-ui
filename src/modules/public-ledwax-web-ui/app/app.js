'use strict';
/**
 * Module dependencies
 */
var appDependencies = [ 'ngRoute',
	'ngSanitize',
	'ngCookies',
	'ngAnimate',
	'ui.bootstrap',
	'pascalprecht.translate',
	'color.picker',
	'rzModule',
	'LEDWAXW3.app',
	'LEDWAXW3.version',
	'LEDWAXW3.description',
	'LEDWAXW3.login',
	'LEDWAXW3.logout',
	'LEDWAXW3.leds',
	'LEDWAXW3.setup',
	'LEDWAXW3.about',
	'LEDWAXW3.services',
	'LEDWAXW3.characters',
	'LEDWAXW3.ledwaxStripType',
	'LEDWAXW3.ledwaxDisplayMode',
	'LEDWAXW3.ledwaxFadeMode',
	'LEDWAXW3.characters',
	'LEDWAXW3.humanReadableByteCount'
];
/**
 * Start of block required for e2e tests
 */
var mocks = parent.parent ? parent.parent.mocks : parent.mocks;
mocks = mocks || [];
var dependencies = (mocks ? mocks : []).concat(appDependencies);
/**
 * End of block required for e2e tests
 */
/**
 * Configuration
 */
// Declare app level module which depends on filters, and services
var ledwaxApp = angular.module('LEDWAXW3', appDependencies);
ledwaxApp.config([ '$routeProvider', '$translateProvider', '$provide',
	function($routeProvider, $translateProvider, $provide) {
		$routeProvider.when('/setup', {
			templateUrl : 'partials/setup.html'
		});
		$routeProvider.when('/about', {
			templateUrl : 'partials/about.html'
		});
		$routeProvider.when('/devicedetail/:deviceId', {
			templateUrl : 'partials/devicedetail.html'
		});
		$routeProvider.when('/login', {
			templateUrl : 'partials/login.html'
		});
		$routeProvider.when('/leds', {
			templateUrl : 'partials/leds.html'
		});
		$routeProvider.when('/logout', {
			controller : 'LogoutCtrl',
			templateUrl : 'partials/login.html'
		});
		$routeProvider.otherwise({
			redirectTo : '/login'
		});
		$translateProvider.useStaticFilesLoader({
			prefix : 'l10n/',
			suffix : '.json'
		});
		$translateProvider.preferredLanguage('en_US');
		$translateProvider.useCookieStorage();
		$provide.decorator('ColorPickerOptions', ($delegate) => {
			var options = angular.copy($delegate);
			options.round = true;
			options.alpha = false;
			options.format = 'rgb';
			return options;
		});
	} ]);
/**
 * Start of block required for e2e tests
 */
if (undefined != mocks.initializeMocks) {
	ledwaxApp.run(mocks.initializeMocks);
}
/**
 * End of block required for e2e tests
 */