'use strict';

angular.module('LEDWAXW3.version.interpolate-filter', [])
	.filter('appVersion', [ 'version', function(version) {
		return function(text) {
			return String(text).replace(/\%VERSION\%/mg, version);
		};
	} ]).filter('appDescription', [ 'description', function(description) {
	return function(text) {
		return String(text).replace(/\%DESCRIPTION\%/mg, description);
	};
} ]);