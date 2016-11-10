'use strict';

describe('LEDWAXW3.setup module', function() {

	// mock controller
	beforeEach(module('LEDWAXW3.setup'));
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

	describe('setup controller', function() {
		var scope,
			ctrl,
			configService,
			restService;

		it('should load ...', inject(function($controller, $rootScope, $cookies,
			$sanitize, $translate, $filter, Settings, REST_IoT) {
			scope = $rootScope.$new();
			var restService = REST_IoT;
			var settingsService = Settings;
			ctrl = $controller('SetupCtrl', {
				$rootScope : $rootScope,
				$scope : scope,
				$cookies : $cookies,
				$sanitize : $sanitize,
				$translate : $translate,
				$filter : $filter,
				Settings : settingsService,
				REST_IoT : restService
			});
			expect(ctrl).toBeDefined();
		}));

	});
});