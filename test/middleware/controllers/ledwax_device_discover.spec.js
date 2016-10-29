#!/usr/bin/env node
'use strict';

const assert = require('assert');
const async = require('async');
let pg = require('pg');
const boom = require('boom');

const hcAuthToken = '254406f79c1999af65a7df4388971354f85cfee9';

describe('api', function() {

	let server,
		db,
		particleConfig;

	beforeAll(function(done) {
		server = require('../mockserver.js').createServer();
		particleConfig = server.methods.particle.config();
		done();
	});

	describe('ledwax device discover controller', () => {

		it('empty login responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverDevices'
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(JSON.parse(response.payload).message)
					.toBe('Error: child "authtoken" fails because ["authtoken" is required]');
				done();
			});
		});

		it('login with empty authtoken respond with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverDevices?authtoken='
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(JSON.parse(response.payload).message)
					.toBe('Error: child "authtoken" fails because ["authtoken" is not allowed to be empty]');
				done();
			});
		});

		it('invalid credentials respond with 417 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/discoverDevices?authtoken=foobar'
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(417);
				let pl = JSON.parse(response.payload);
				if (pl.message) {
					expect(pl.message).toBe('Error: HTTP error 422 from ' +
						response.request.server.methods.particle.config().baseUrl +
						'/v1/devices');
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
				expect(response.statusCode).toBe(200);
				let pl = JSON.parse(response.payload);
				if (pl && typeof pl.length != 'undefined') {
					expect(pl.length).toBe(1);
					expect(pl[0].name).toBe('ledwax_2');
				} else {
					fail('no payload returned');
				}
				done();
			});
		});

	});

});