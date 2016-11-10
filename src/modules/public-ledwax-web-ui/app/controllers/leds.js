'use strict';

angular.module('LEDWAXW3.leds', [ 'LEDWAXW3.services' ])
	.controller('AboutCtrl', [ '$scope', 'REST_IoT', function($scope, REST_IoT) {
		$rootScope.setPhantomStatusReady();
	} ]);