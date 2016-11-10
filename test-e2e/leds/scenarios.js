'use strict';

describe('LEDWax Web UI', function() {

	describe('leds', function() {

		beforeEach(function() {
			browser.get('index.html#/leds');
		});


		it('should render leds when user navigates to /leds', function() {
			expect(element.all(by.css('[ng-view] p')).first().getText()).toMatch(/This is the partial for leds/);
		});

	});
});