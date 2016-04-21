'use strict';

angular.module(
		'LEDWAXW3.setup',
		[ 'ngCookies', 'ngSanitize', 'pascalprecht.translate',
				'LEDWAXW3.services' ])

.controller(
		'SetupCtrl',
		[
				'$rootScope',
				'$scope',
				'$cookies',
				'$sanitize',
				'$translate',
				'Config',
				'REST_IoT',
				function($rootScope, $scope, $cookies, $sanitize, $translate,
						Config, REST_IoT) {
					$scope.getDeviceList = function() {
						var devList = REST_IoT
								.getDevices($scope.userSession.auth_token);
						return devList;
					}
				} ]);