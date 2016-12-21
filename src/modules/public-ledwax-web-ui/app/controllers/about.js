'use strict';

angular.module('LEDWAXW3.about', [ 'LEDWAXW3.services' ])
	.controller('AboutCtrl', [ '$rootScope', '$scope', 'REST_IoT', function($rootScope, $scope, REST_IoT) {
		$rootScope.setPhantomStatusReady();
	} ]);