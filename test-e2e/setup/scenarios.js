'use strict';

describe('my app', function() {

	it('should automatically redirect to /login when location hash/fragment is empty', function() {
		browser.get('index.html');
		expect(browser.getLocationAbsUrl()).toMatch("/login");
	});

	describe('setup', function() {

		beforeEach(function() {
			browser.get('index.html#/setup');
		});

		it('should render setup when user navigates to /setup', function() {
			let table = element.all(by.css('.devices-table tbody tr')).first();
			// let btn = browser.findElement(by.id('btn_reset'));
			expect(table.getText()).toMatch(/bar wax/);
		});

		it('should sort by name and type', function() {
			let table = element.all(by.css('.devices-table tbody tr')).first();
			element(by.css('.devices-table thead tr th:nth-child(2)')).click();
			expect(table.getText()).toMatch(/quux unknown/);
			element(by.css('.devices-table thead tr th')).click();
			expect(table.getText()).toMatch(/bar wax/);
		});

	});
});