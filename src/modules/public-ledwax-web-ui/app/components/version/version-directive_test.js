'use strict';

describe('LEDWAXW3.version module', function() {
	beforeEach(module('LEDWAXW3.version'));

	describe('app-version directive', function() {
		it('should print current version',
				function() {
					module(function($provide) {
						$provide.value('version', 'TEST_VER');
					});
					inject(function($compile, $rootScope) {
						var element = $compile('<span app-version></span>')(
								$rootScope);
						expect(element.text()).toEqual('TEST_VER');
					});
				});
	});

	describe('app-description directive', function() {
		it('should print app description', function() {
			module(function($provide) {
				$provide.value('description', 'TEST_DESC');
			});
			inject(function($compile, $rootScope) {
				var element = $compile('<span app-description></span>')(
						$rootScope);
				expect(element.text()).toEqual('TEST_DESC');
			});
		});
	});
});
