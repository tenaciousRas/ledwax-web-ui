'use strict';
/**
 * Module dependencies
 */
var appDependencies = ['ngRoute',
	'ngSanitize',
	'ngCookies',
	'ngAnimate',
	'ui.bootstrap',
	'pascalprecht.translate',
	'LEDWAXW3.app',
	'LEDWAXW3.version',
	'LEDWAXW3.description',
	'LEDWAXW3.login',
	'LEDWAXW3.leds',
	'LEDWAXW3.setup',
	'LEDWAXW3.about',
	'LEDWAXW3.filters',
	'LEDWAXW3.services',
	'LEDWAXW3.directives'
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
ledwaxApp.config(['$routeProvider', '$translateProvider',
		function($routeProvider, $translateProvider) {
	$routeProvider.when('/setup', {templateUrl: 'partials/setup.html', controller: 'SetupCtrl'});
	$routeProvider.when('/about', {templateUrl: 'partials/about.html', controller: 'AboutCtrl'});
	$routeProvider.when('/devicedetail/:deviceId', {templateUrl: 'partials/devicedetail.html', controller: 'LEDsCtrl'});
	$routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginCtrl'});
	$routeProvider.when('/leds', {templateUrl: 'partials/leds.html', controller: 'LEDsCtrl'});
	$routeProvider.otherwise({redirectTo: '/login'});
	$translateProvider.useStaticFilesLoader({
		prefix : 'l10n/',
		suffix : '.json'
	});
	$translateProvider.preferredLanguage('en_US');
	$translateProvider.useCookieStorage();
}]);
/**
 * Start of block required for e2e tests
 */
if (undefined != mocks.initializeMocks) {
	ledwaxApp.run(mocks.initializeMocks);
}
/**
 * End of block required for e2e tests
 */