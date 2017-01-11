'use strict';

describe('LEDWAXW3.logout module', function() {

	beforeEach(module('LEDWAXW3.logout'));
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
			sessiontoken : 'febbc032-48230-4',
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

	describe('logout controller', function() {
		var scope,
			ctrl,
			configService,
			restService;

		it('should load controller ...', inject(function($controller,
			$rootScope, $cookies, $location, $sanitize, $translate, Config, REST_IoT) {
			scope = initScope($rootScope);
			configService = Config;
			restService = REST_IoT;
			ctrl = $controller('LogoutCtrl', {
				$rootScope : $rootScope,
				$scope : scope,
				$cookies : $cookies,
				$location : $location,
				$sanitize : $sanitize,
				$translate : $translate,
				Config : configService,
				REST_IoT : restService
			});
			expect(ctrl).toBeDefined();
		}));

	});
});