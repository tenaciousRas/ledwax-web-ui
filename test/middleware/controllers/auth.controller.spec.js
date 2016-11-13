#!/usr/bin/env node
'use strict';

const assert = require('assert');
let pg = require('pg');
const boom = require('boom');

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

	describe('auth controller', () => {

		it('empty login responds with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/user/login',
				payload : {}
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					let pl = JSON.parse(response.payload);
					expect(pl.message).toBe('Error: child "username" fails because ["username" is required]');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});
		});

		it('login with empty password respond with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/user/login',
				payload : {
					username : 'bar',
					cloudid : 1
				}
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					let pl = JSON.parse(response.payload);
					expect(pl.message).toBe('Error: child "password" fails because ["password" is required]');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});
		});

		it('login with empty username respond with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/user/login',
				payload : {
					password : 'foo',
					cloudid : 1
				}
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					let pl = JSON.parse(response.payload);
					expect(pl.message).toBe('Error: child "username" fails because ["username" is required]');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});
		});

		it('login with empty cloudid respond with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/user/login',
				payload : {
					password : 'foo',
					username : 'bar'
				}
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					let pl = JSON.parse(response.payload);
					expect(pl.message).toBe('Error: child "cloudid" fails because ["cloudid" is required]');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});
		});

		it('invalid credentials respond with 417 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/user/login',
				payload : {
					username : 'foo',
					password : 'bar',
					cloudid : 1
				}
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(417);
					let pl = JSON.parse(response.payload);
					expect(pl.message).toBe('Error: HTTP error 417 from ' +
						particleConfig.baseUrl +
						'/oauth/token');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});

		});

		it('valid login should respond with 200 OK', (done) => {
			let options = {
				method : 'POST',
				url : '/user/login',
				payload : {
					username : 'user',
					password : 'password',
					cloudid : 1
				}
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(200);
				try {
					let pl = JSON.parse(response.payload);
					expect(typeof pl.sessiontoken).not.toBe('undefined');
					expect(pl.sessiontoken.length).toBeGreaterThan(0);
					expect(typeof pl.userid).not.toBe('undefined');
				} catch (e) {
					fail('unexpected error:\n' + e);
				}
				done();
			});
		});

	});

});