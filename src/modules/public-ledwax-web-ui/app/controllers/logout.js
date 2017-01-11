'use strict';

angular
	.module(
		'LEDWAXW3.logout',
		[ 'ngCookies', 'ngSanitize', 'pascalprecht.translate',
			'LEDWAXW3.services' ])

	.controller(
		'LogoutCtrl',
		[
			'$rootScope',
			'$scope',
			'$cookies',
			'$location',
			'$sanitize',
			'$translate',
			'REST_IoT',
			function($rootScope, $scope, $cookies, $location, $sanitize,
				$translate, REST_IoT) {
				if (angular.isDefined($rootScope.userSession)) {
					$rootScope.userSession.cookietoken = null;
					$rootScope.userSession.persist = false;
				}
				if (angular.isDefined($scope.userSession)) {
					$scope.userSession.cookietoken = null;
					$scope.userSession.persist = false;
				}
				var expiry = new Date();
				expiry.setDate(expiry.getDate() - 1);
				let cookOpts = {
					expires : expiry
				};
				$cookies.put('sessiontoken', '', cookOpts);
				console.log("user logged out");
				$scope.topnav.pop();
				$scope.topnav.push({
					active : false,
					path : '/login',
					label : 'NAV_LOGIN'
				});
				$scope.goToNav('/login');
			} ]);