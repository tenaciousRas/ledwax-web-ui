'use strict';

angular
	.module(
		'LEDWAXW3.login',
		[ 'ngCookies', 'ngSanitize', 'pascalprecht.translate',
			'LEDWAXW3.services' ])

	.controller(
		'LoginCtrl',
		[
			'$rootScope',
			'$scope',
			'$cookies',
			'$sanitize',
			'$translate',
			'Settings',
			'REST_IoT',
			function($rootScope, $scope, $cookies, $sanitize,
				$translate, Settings, REST_IoT) {
				$scope.forms.login.login = function(user) {
					$scope.forms.login.cache = angular.copy(user);
					$scope.userSession.from_login = true;
					var loginResult = REST_IoT.serverLogin(
						user.username, user.password);
					if (!loginResult.error) {
						$scope.userSession.auth_token = loginResult.auth_token;
						// set cookie expiration
						var expiry = new Date();
						if (user.persist) {
							$scope.userSession.persist = true;
							expiry.setDate(expiry.getYear() + 1000);
						}
						// set cookie
						$cookies.put('auth_token',
							loginResult.auth_token, {
								expires : expiry
							});
					} else {
						// login failed
						$scope.userSession.auth_token = null;
						$scope.userSession.persist = false;
						var expiry = new Date();
						expiry.setDate(expiry.getDate() - 1);
						$cookies.put('auth_token', '', {
							expires : expiry
						});
					}
				};
				$scope.forms.login.clear = function(user) {
					$scope.userSession.username = '';
					$scope.userSession.password = '';
					$scope.userSession.persist = false;
				};
				$scope.forms.login.reset = function() {
					$scope.userSession = angular
						.copy($scope.forms.login.cache);
				};
				$scope.forms.login.clear();
				$rootScope.setPhantomStatusReady();
			} ]);