'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('my app', function() {

  it('should automatically redirect to /login when location hash/fragment is empty', function() {
    browser.get('index.html');
    expect(browser.getLocationAbsUrl()).toMatch("/login");
  });

  describe('login', function() {

    beforeEach(function() {
      browser.get('index.html#/login');
    });


    it('should render login when user navigates to /login', function() {
      expect(element.all(by.css('[ng-view] form legend')).first().getText()).
        toMatch(/LEDWax Login/);
    });

    it('should accept login form input', function() {
    	element(by.model('user.username')).sendKeys('foo');
    	element(by.model('user.password')).sendKeys('bar');
        expect(element.all(by.css('[ng-view] form input')).get(0).getAttribute('value')).
        	toMatch('foo');
        expect(element.all(by.css('[ng-view] form input')).get(1).getAttribute('value')).
        	toMatch('bar');
	});

    it('should clear input fields when clear button clicked', function() {
    	element(by.model('user.username')).sendKeys('foo');
    	element(by.model('user.password')).sendKeys('bar');
    	element(by.css('[id="btn_clear"]')).click();
        expect(element.all(by.css('[ng-view] form input')).get(0).getAttribute('value')).
        	toMatch('');
        expect(element.all(by.css('[ng-view] form input')).get(1).getAttribute('value')).
        	toMatch('');
	});

    it('should reset input fields when reset button clicked', function() {
    	element(by.model('user.username')).sendKeys('foo');
    	element(by.model('user.password')).sendKeys('bar');
    	element(by.css('[id="btn_login"]')).click();
    	element.all(by.css('[ng-view] form input')).get(0).sendKeys('baz');
    	element.all(by.css('[ng-view] form input')).get(1).sendKeys('quux');
    	element(by.css('[id="btn_reset"]')).click();
        expect(element.all(by.css('[ng-view] form input')).get(0).getAttribute('value')).
        	toMatch('foo');
        expect(element.all(by.css('[ng-view] form input')).get(1).getAttribute('value')).
        	toMatch('bar');
	});

  });


  describe('secure site access', function() {

	    beforeEach(function() {
	      browser.deleteAllCookies();
	    });


	    it('should redirect to login when user navigates to /leds without an auth token', function() {
	      browser.get('index.html#/leds');
	      expect(element.all(by.css('[ng-view] form legend')).first().getText()).
	        toMatch(/LEDWax Login/);
	    });

	  });


  describe('leds', function() {

    beforeEach(function() {
      browser.get('index.html#/leds');
    });


    it('should render leds when user navigates to /leds', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 2/);
    });

  });
});
