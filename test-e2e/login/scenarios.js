'use strict';

describe('LEDWax Web UI', function() {

	it('should automatically redirect to /login when location hash/fragment is empty', function() {
		browser.get('index.html');
		expect(browser.getLocationAbsUrl()).toMatch("/login");
	});

	describe('login', function() {

		beforeEach(function() {
			browser.get('index.html#/login');
		});


		it('should render login when user navigates to /login', function() {
			expect(element.all(by.css('[ng-view] form legend')).first().getText()).toMatch(/LEDWax Login/);
		});

		it('should accept login form input', function() {
			element(by.model('userSession.username')).sendKeys('foo');
			element(by.model('userSession.password')).sendKeys('bar');
			expect(element.all(by.css('[ng-view] form input')).get(0).getAttribute('value')).toMatch('foo');
			expect(element.all(by.css('[ng-view] form input')).get(1).getAttribute('value')).toMatch('bar');
		});

		it('should clear input fields when clear button clicked', function() {
			element(by.model('userSession.username')).sendKeys('foo');
			element(by.model('userSession.password')).sendKeys('bar');
			element(by.css('[id="btn_clear"]')).click();
			expect(element.all(by.css('[ng-view] form input')).get(0).getAttribute('value')).toMatch('');
			expect(element.all(by.css('[ng-view] form input')).get(1).getAttribute('value')).toMatch('');
		});

		it('should reset input fields when reset button clicked', function() {
			element(by.model('userSession.username')).sendKeys('foo');
			element(by.model('userSession.password')).sendKeys('bar');
			element(by.css('[id="btn_login"]')).click();
			element.all(by.css('[ng-view] form input')).get(0).sendKeys('baz');
			element.all(by.css('[ng-view] form input')).get(1).sendKeys('quux');
			element(by.css('[id="btn_reset"]')).click();
			expect(element.all(by.css('[ng-view] form input')).get(0).getAttribute('value')).toMatch('foo');
			expect(element.all(by.css('[ng-view] form input')).get(1).getAttribute('value')).toMatch('bar');
		});

	});


	describe('secure site access', function() {

		beforeEach(function() {
			browser.manage().deleteAllCookies();
		});


		it('should redirect to login when user navigates to /leds without an auth token', function() {
			browser.get('index.html#/leds');
			expect(element.all(by.css('[ng-view] form legend')).first().getText()).toMatch(/LEDWax Login/);
		});

	});

});