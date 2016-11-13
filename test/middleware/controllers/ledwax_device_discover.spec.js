#!/usr/bin/env node
'use strict';

const assert = require('assert');
const async = require('async');
let pg = require('pg');
const boom = require('boom');

const hcAuthToken = '254406f79c1999af65a7df4388971354f85cfee9';
const hcDeviceId = '360043000a47343432313031';

describe('api', function() {

	let server,
		db,
		particleConfig;

	beforeAll(function(done) {
		server = require('../mockserver.js').createServer();
		particleConfig = server.methods.particle.config();
		setTimeout(() => {
			done();
		}, 2000);
	});

	describe('ledwax device discover controller discoverDevices', () => {

		it('empty login responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverDevices'
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					let pl = JSON.parse(response.payload);
					expect(pl.message)
						.toBe('Error: child "authtoken" fails because ["authtoken" is required]');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});
		});

		it('login with empty authtoken respond with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverDevices?authtoken='
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					let pl = JSON.parse(response.payload);
					expect(pl.message)
						.toBe('Error: child "authtoken" fails because ["authtoken" is not allowed to be empty]');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});
		});

		it('invalid credentials respond with 417 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverDevices?authtoken=foobar'
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(417);
					let pl = JSON.parse(response.payload);
					expect(pl.message).toBe('Error: HTTP error 422 from ' +
						response.request.server.methods.particle.config().baseUrl +
						'/v1/devices');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});

		});

		it('valid credentials should respond with 200 OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverDevices?authtoken=' + hcAuthToken
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(200);
					let pl = JSON.parse(response.payload);
					expect(pl.length).toBe(1);
					expect(pl[0].name).toBe('ledwax_2');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});
		});

	});

	describe('ledwax device discover controller discoverCaps', () => {

		it('empty login responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverCaps'
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					let pl = JSON.parse(response.payload);
					expect(pl.message)
						.toBe('Error: child "authtoken" fails because ["authtoken" is required]');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});
		});

		it('login with empty authtoken respond with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverCaps?authtoken='
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					let pl = JSON.parse(response.payload);
					expect(pl.message).toBe('Error: child "authtoken" fails because ["authtoken" is not allowed to be empty]');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});
		});

		it('invalid credentials respond with 417 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverCaps?authtoken=foobar&deviceId=' + hcDeviceId
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(417);
					let pl = JSON.parse(response.payload);
					expect(pl.message).toBe('Error: HTTP error 422 from ' +
						response.request.server.methods.particle.config().baseUrl +
						'/v1/devices/' + hcDeviceId);
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});

		});

		it('valid credentials, invalid device respond with 417-masked 404 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverCaps?authtoken=' + hcAuthToken + '&deviceId=foobar'
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(417);
					let pl = JSON.parse(response.payload);
					expect(pl.message).toBe('Error: HTTP error 404 from ' +
						response.request.server.methods.particle.config().baseUrl +
						'/v1/devices/foobar');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});

		});

		it('valid credentials should respond with 200 OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverCaps?authtoken=' + hcAuthToken + '&deviceId=' + hcDeviceId
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(200);
					let pl = JSON.parse(response.payload);
					expect(pl.dvcId).toBe(hcDeviceId);
					expect(pl.vrs.length).toBe(10);
					expect(pl.fns.length).toBe(2);
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});
		});

	});

});