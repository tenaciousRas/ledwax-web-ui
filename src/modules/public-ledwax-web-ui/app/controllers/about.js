'use strict';

angular.module('LEDWAXW3.about', [ 'LEDWAXW3.services' ])
	.controller('AboutCtrl', [ '$scope', 'REST_IoT', function($scope, REST_IoT) {
		$rootScope.setPhantomStatusReady();
	} ]);