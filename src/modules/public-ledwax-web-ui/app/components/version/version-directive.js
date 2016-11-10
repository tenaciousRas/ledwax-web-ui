'use strict';

angular.module('LEDWAXW3.version.version-directive', [])
	.directive('appVersion', [ 'version', function(version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	} ]).directive('appDescription', [ 'description', function(description) {
	return function(scope, elm, attrs) {
		elm.text(description);
	};
} ]);