'use strict';

describe('LEDWAXW3.setup module', function() {

	beforeEach(module('LEDWAXW3.setup'));

	describe('setup controller', function() {
		var scope, ctrl, configService, restService;

		it('should load ...', inject(function($rootScope, $scope, $cookies,
				$sanitize, $translate, Config, REST_IoT) {
			scope = $rootScope.$new();
			restService = REST_IoT;
			ctrl = $controller('SetupCtrl', {
				$scope : scope,
				REST_IoT : restService
			});
			expect(ctrl).toBeDefined();
		}));

	});
});