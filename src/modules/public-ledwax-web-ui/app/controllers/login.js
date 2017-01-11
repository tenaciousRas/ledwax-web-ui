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
			'$location',
			'$sanitize',
			'$translate',
			'Settings',
			'REST_IoT',
			function($rootScope, $scope, $cookies, $location, $sanitize,
				$translate, Settings, REST_IoT) {
				$scope.forms.login.login = function(user) {
					$scope.forms.login.cache = angular.copy(user);
					$scope.userSession.from_login = true;
					var p = REST_IoT.serverLogin($scope.currentCloudHost.id, user.username, user.password);
					p.then(function(data) {
						$scope.userSession.username = user.username;
						var loginResult = data;
						console.log(loginResult);
						if (loginResult && !loginResult.error) {
							// login success
							$scope.userSession.userid = loginResult.userid;
							$scope.userSession.sessiontoken = loginResult.sessiontoken;
							// set cookie expiration
							let cookOpts = {};
							let expiry = new Date();
							if (user.persist) {
								$scope.userSession.persist = true;
								expiry.setDate(expiry.getYear() + 1000);
								cookOpts.expires = expiry;
							}
							// set cookie
							$cookies.put('sessiontoken',
								loginResult.sessiontoken,
								cookOpts);
							$scope.topnav.pop();
							$scope.topnav.push({
								active : false,
								path : '/logout',
								label : 'NAV_LOGOUT'
							});
							$scope.goToNav('/leds');
						} else {
							// login failed
							console.log("login failed");
							$scope.userSession.sessiontoken = null;
							$scope.userSession.persist = false;
							var expiry = new Date();
							expiry.setDate(expiry.getDate() - 1);
							let cookOpts = {
								expires : expiry
							};
							$cookies.put('sessiontoken', '', cookOpts);
						}
					});
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