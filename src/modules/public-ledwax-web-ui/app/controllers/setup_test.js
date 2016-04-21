'use strict';

describe('LEDWAXW3.setup module', function() {

	beforeEach(module('LEDWAXW3.setup'));

	describe('setup controller', function() {
		var scope, ctrl, configService, restService;

		it('should load ...', inject(function($controller, $rootScope, $cookies,
				$sanitize, $translate, Config, REST_IoT) {
			scope = $rootScope.$new();
			restService = REST_IoT;
			ctrl = $controller('SetupCtrl', {
				$rootScope : $rootScope,
				$scope : scope,
				$cookies : $cookies,
				$sanitize : $sanitize,
				$translate : $translate,
				REST_IoT : restService
			});
			expect(ctrl).toBeDefined();
		}));

	});
});