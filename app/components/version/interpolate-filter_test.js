'use strict';

describe('LEDWAXW3.version module', function() {
	beforeEach(module('LEDWAXW3.version'));

	describe('appVersion filter', function() {
		beforeEach(module(function($provide) {
			$provide.value('version', 'TEST_VER');
		}));

		it('should replace VERSION', inject(function(appVersionFilter) {
			expect(appVersionFilter('before %VERSION% after')).toEqual(
					'before TEST_VER after');
		}));
	});

	describe('appDescription filter', function() {
		beforeEach(module(function($provide) {
			$provide.value('description', 'TEST_DESC');
		}));

		it('should replace DESCRIPTION', inject(function(appDescriptionFilter) {
			expect(appDescriptionFilter('before %DESCRIPTION% after')).toEqual(
					'before TEST_DESC after');
		}));
	});
});
