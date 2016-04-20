'use strict';

describe('LEDWAXW3.login module', function() {

	beforeEach(module('LEDWAXW3.login'));
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

	function initScope(rootScope) {
		var scope;
		scope = rootScope.$new();
		scope.userSession = {
			username : null,
			password : null,
			auth_token : 'febbc032-48230-4',
			persist : false,
			from_login : false
		};
		scope.forms = {
			login : {
				cache : {}
			}
		};
		rootScope.setPhantomStatusReady = function() {
			rootScope.phantom_status = 'ready';
		};
		return scope;
	}

	describe('login controller', function() {
		var scope, ctrl, configService, restService;

		it('should load controller ...', inject(function($controller,
				$rootScope, $cookies, $sanitize, $translate, Config, REST_IoT) {
			scope = initScope($rootScope);
			configService = Config;
			restService = REST_IoT;
			ctrl = $controller('LoginCtrl', {
				$rootScope : $rootScope,
				$scope : scope,
				$cookies : $cookies,
				$sanitize : $sanitize,
				$translate : $translate,
				Config : configService,
				REST_IoT : restService
			});
			expect(ctrl).toBeDefined();
		}));

		it('should reset and clear scope and form cache vars', inject(function($controller,
				$rootScope, $cookies, $sanitize, $translate, Config, REST_IoT) {
			scope = initScope($rootScope);
			configService = Config;
			restService = REST_IoT;
			ctrl = $controller('LoginCtrl', {
				$rootScope : $rootScope,
				$scope : scope,
				$cookies : $cookies,
				$sanitize : $sanitize,
				$translate : $translate,
				Config : configService,
				REST_IoT : restService
			});
			scope.userSession.username = 'foo';
			scope.userSession.password = 'bar';
			scope.forms.login.clear();
			expect(scope.userSession.auth_token).toEqual('febbc032-48230-4');
			expect(scope.userSession.from_login).toEqual(false);
			expect(scope.userSession.persist).toEqual(false);
			expect(scope.userSession.username).toEqual('');
			expect(scope.userSession.password).toEqual('');
			scope.userSession.username = 'foo';
			scope.userSession.password = 'bar';
			scope.forms.login.cache = scope.userSession;
			scope.forms.login.cache.username = 'baz';
			scope.forms.login.cache.password = 'quux';
			scope.forms.login.reset();
			expect(scope.userSession.auth_token).toEqual('febbc032-48230-4');
			expect(scope.userSession.from_login).toEqual(false);
			expect(scope.userSession.persist).toEqual(false);
			expect(scope.userSession.username).toEqual('baz');
			expect(scope.userSession.password).toEqual('quux');
		}));

	});

	describe('with invalid login credentials', function() {

		beforeEach(module(function($provide) {
			$provide.service('REST_IoT', function($http) {
				var ret = {};
				ret.serverLogin = function() {
					return {
						error : true,
						auth_token : null
					};
				};
				ret.getDevices = function() {
					return {};
				};
				return ret;
			});
		}));

		var scope, ctrl, configService, restService;

		it('should not set user session and clear cookies', inject(function(
				$controller, $rootScope, $cookies, $sanitize, $translate,
				Config, REST_IoT) {
			scope = initScope($rootScope);
			configService = Config;
			restService = REST_IoT;
			ctrl = $controller('LoginCtrl', {
				$rootScope : $rootScope,
				$scope : scope,
				$cookies : $cookies,
				$sanitize : $sanitize,
				$translate : $translate,
				Config : configService,
				REST_IoT : restService
			});
			scope.forms.login.login({
				username : 'foo',
				password : 'bar',
				persist : true
			});
			expect(scope.userSession.auth_token).toEqual(null);
			expect(scope.userSession.persist).toEqual(false);
			expect(scope.userSession.from_login).toEqual(true);
			expect($cookies.get('auth_token')).toEqual('');
		}));

	});

	describe('with valid login credentials', function() {

		beforeEach(module(function($provide) {
			$provide.service('REST_IoT', function($http) {
				var ret = {};
				ret.serverLogin = function() {
					return {
						error : false,
						auth_token : 'foo_bar_baz'
					};
				};
				ret.getDevices = function() {
					return {};
				};
				return ret;
			});
		}));

		var scope, ctrl, configService, restService;

		it('should set user session and cookie', inject(function($controller,
				$rootScope, $cookies, $sanitize, $translate, Config, REST_IoT) {
			scope = initScope($rootScope);
			configService = Config;
			restService = REST_IoT;
			ctrl = $controller('LoginCtrl', {
				$rootScope : $rootScope,
				$scope : scope,
				$cookies : $cookies,
				$sanitize : $sanitize,
				$translate : $translate,
				Config : configService,
				REST_IoT : restService
			});
			scope.forms.login.login({
				username : 'user',
				password : 'password',
				persist : true
			});
			expect(scope.userSession.auth_token).toEqual('foo_bar_baz');
			expect(scope.userSession.persist).toEqual(true);
			expect(scope.userSession.from_login).toEqual(true);
			expect($cookies.get('auth_token')).toEqual('foo_bar_baz');
		}));

	});
});