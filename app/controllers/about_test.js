'use strict';

describe('LEDWAXW3.about module', function() {

	beforeEach(module('LEDWAXW3.about'));

	describe('about controller', function() {
		var scope, ctrl, configService, restService;

		it('should load ...',
				inject(function($controller, $rootScope, REST_IoT) {
					scope = $rootScope.$new();
					restService = REST_IoT;
					ctrl = $controller('AboutCtrl', {
						$scope : scope,
						REST_IoT : restService
					});
					expect(ctrl).toBeDefined();
				}));

	});
});