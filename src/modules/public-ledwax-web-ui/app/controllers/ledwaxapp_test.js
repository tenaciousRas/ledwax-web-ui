'use strict';

describe(
	'LEDWAXW3.ledwaxapp module',
	function() {
		var mockConfig,
			mockREST_IoT;

		// mock controller
		beforeEach(module('LEDWAXW3.app'));
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
				configService,
				restService;

			it('should load controller...', inject(function($controller,
				$rootScope, $route, $window, $location, $routeParams,
				$cookies, $filter, $sanitize, $translate, Config,
				REST_IoT) {
				scope = $rootScope.$new();
				configService = Config;
				restService = REST_IoT;
				inject(function(Config, REST_IoT) {
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
						Config : configService,
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
					auth_token : null,
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
				inject(function($controller, $rootScope, $route,
					$window, $location, $routeParams, $cookies,
					$filter, $sanitize, $translate, Config,
					REST_IoT) {
					scope = $rootScope.$new();
					configService = Config;
					restService = REST_IoT;
					inject(function(Config, REST_IoT) {
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
							Config : configService,
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
					configService,
					restService;
				it(
					'should not set user session authenticated if cookie present',
					inject(function($controller, $rootScope,
						$route, $window, $location,
						$routeParams, $cookies, $filter,
						$sanitize, $translate, Config, REST_IoT) {
						scope = $rootScope.$new();
						configService = Config;
						restService = REST_IoT;
						inject(function(Config, REST_IoT) {
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
								Config : configService,
								REST_IoT : restService
							});
						});
						expect(ctrl).toBeDefined();
						expect(scope.userSession.auth_token)
							.toEqual(null);
						expect(scope.userSession.persist).toEqual(
							false);
						expect(scope.userSession.from_login)
							.toEqual(false);
					}));

				it(
					'should set user session authenticated if cookie present',
					inject(function($controller, $rootScope,
						$route, $window, $location,
						$routeParams, $cookies, $filter,
						$sanitize, $translate, Config, REST_IoT) {
						scope = $rootScope.$new();
						configService = Config;
						restService = REST_IoT;
						$cookies.put('auth_token', 'foo_bar_baz');
						inject(function(Config, REST_IoT) {
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
								Config : configService,
								REST_IoT : restService
							});
						});
						expect(ctrl).toBeDefined();
						expect(scope.userSession.auth_token)
							.toEqual('foo_bar_baz');
						expect(scope.userSession.persist).toEqual(
							true);
						expect(scope.userSession.from_login)
							.toEqual(false);
					}));
			});

	});