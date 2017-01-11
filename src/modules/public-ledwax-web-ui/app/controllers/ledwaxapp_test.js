'use strict';

describe(
	'LEDWAXW3.ledwaxapp module',
	function() {
		var mockSettings,
			mockREST_IoT;

		// mock controller
		beforeEach(module('LEDWAXW3.app'));
		// mock REST_IoT
		beforeEach(module(function($provide) {
			$provide.service('REST_IoT', function($http) {
				var ret = {};
				ret.serverLogin = function() {
					return {
						foo : "bar"
					};
				};
				ret.getDevices = function() {
					return {
						bar : "baz"
					};
				};
				return ret;
			});
		}));
		// mock cookies
		beforeEach(module({
			$cookies : {
				store : {},
				put : function(key, value) {
					this.store[key] = value;
				},
				get : function(key) {
					return this.store[key];
				}
			}
		}));

		describe('ledwaxapp controller', function() {
			var scope,
				ctrl,
				settingsService,
				restService;

			it('should load controller...', inject(function($rootScope, $scope, $route, $window, $location,
				$routeParams, $cookies, $filter, $sanitize, $translate,
				Settings, REST_IoT) {
				var scope = $rootScope.$new(),
					settingsService = Settings,
					restService = REST_IoT;
				inject(function(Settings, REST_IoT) {
					ctrl = $controller('AppCtrl', {
						$rootScope : $rootScope,
						$scope : scope,
						$route : $route,
						$window : $window,
						$location : $location,
						$cookies : $cookies,
						$routeParams : $routeParams,
						$filter : $filter,
						$sanitize : $sanitize,
						$translate : $translate,
						Settings : settingsService,
						REST_IoT : restService
					});
				});
				expect(ctrl).toBeDefined();
				expect(REST_IoT.serverLogin()).toEqual({
					foo : "bar"
				});
				expect(scope.userSession).toEqual({
					username : null,
					password : null,
					sessiontoken : null,
					from_login : false,
					persist : false
				});
				expect(scope.forms).toEqual({
					login : {
						cache : {}
					}
				});
			}));

			it('updateNavState should set active nav state',
				inject(function($rootScope, $scope, $route, $window, $location,
					$routeParams, $cookies, $filter, $sanitize, $translate,
					Settings, REST_IoT) {
					var scope = $rootScope.$new(),
						settingsService = Settings,
						restService = REST_IoT;
					inject(function(Settings, REST_IoT) {
						ctrl = $controller('AppCtrl', {
							$rootScope : $rootScope,
							$scope : scope,
							$route : $route,
							$window : $window,
							$location : $location,
							$cookies : $cookies,
							$routeParams : $routeParams,
							$filter : $filter,
							$sanitize : $sanitize,
							$translate : $translate,
							Settings : settingsService,
							REST_IoT : restService
						});
					});
					expect(ctrl).toBeDefined();
					scope.updateNavState('about');
					for (var i = 0; i < scope.topnav.length; i++) {
						if (scope.topnav[i].path == '/about') {
							expect(scope.topnav[i].active)
								.toEqual(true);
							expect(scope.topNavClasses[i]).toEqual(
								'active');
						}
					}
				}));

		});
		describe(
			'ledwaxapp controller cookies',
			function() {
				var scope,
					ctrl,
					settingsService,
					restService;
				it(
					'should not set user session authenticated if cookie present',
					inject(function($rootScope, $scope, $route, $window, $location,
						$routeParams, $cookies, $filter, $sanitize, $translate,
						Settings, REST_IoT) {
						var scope = $rootScope.$new(),
							settingsService = Settings,
							restService = REST_IoT;
						inject(function(Settings, REST_IoT) {
							ctrl = $controller('AppCtrl', {
								$rootScope : $rootScope,
								$scope : scope,
								$route : $route,
								$window : $window,
								$location : $location,
								$cookies : $cookies,
								$routeParams : $routeParams,
								$filter : $filter,
								$sanitize : $sanitize,
								$translate : $translate,
								Settings : settingsService,
								REST_IoT : restService
							});
						});
						expect(ctrl).toBeDefined();
						expect(scope.userSession.sessiontoken)
							.toEqual(null);
						expect(scope.userSession.persist).toEqual(
							false);
						expect(scope.userSession.from_login)
							.toEqual(false);
					}));

				it(
					'should set user session authenticated if cookie present',
					inject(function($rootScope, $scope, $route, $window, $location,
						$routeParams, $cookies, $filter, $sanitize, $translate,
						Settings, REST_IoT) {
						var scope = $rootScope.$new(),
							settingsService = Settings,
							restService = REST_IoT;
						$cookies.put('sessiontoken', 'foo_bar_baz');
						inject(function(Settings, REST_IoT) {
							ctrl = $controller('AppCtrl', {
								$rootScope : $rootScope,
								$scope : scope,
								$route : $route,
								$window : $window,
								$location : $location,
								$cookies : $cookies,
								$routeParams : $routeParams,
								$filter : $filter,
								$sanitize : $sanitize,
								$translate : $translate,
								Settings : settingsService,
								REST_IoT : restService
							});
						});
						expect(ctrl).toBeDefined();
						expect(scope.userSession.sessiontoken)
							.toEqual('foo_bar_baz');
						expect(scope.userSession.persist).toEqual(
							true);
						expect(scope.userSession.from_login)
							.toEqual(false);
					}));
			});

	});