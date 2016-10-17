#!/usr/bin/env node
'use strict';

const assert = require('assert');
let pg = require('pg');
const boom = require('boom');

describe('api', function() {

	let server, db, particleConfig;

	beforeAll(function(done) {
		server = require('../mockserver.js').createServer();
		particleConfig = server.methods.particle.config();
    done();
	});

	describe('auth controller', () => {

		it('empty login responds with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/oauth/login',
				payload: {}
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(JSON.parse(response.payload).message).toBe('Error: child "username" fails because ["username" is required]');
				done();
			});
		});

		it('login with empty password respond with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/oauth/login',
				payload : {username: 'bar'}
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(JSON.parse(response.payload).message).toBe('Error: child "password" fails because ["password" is required]');
				done();
			});
		});

		it('logins with empty username respond with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/oauth/login',
				payload : {password: 'foo'}
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(JSON.parse(response.payload).message).toBe('Error: child "username" fails because ["username" is required]');
				done();
			});
		});

		it('invalid credentials respond with 417 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/oauth/login',
				payload : {username: 'foo', password: 'bar'}
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(417);
				expect(JSON.parse(response.payload).message).toBe('Error: HTTP error 417 from ' +
						response.request.server.methods.particle.config().baseUrl +
						'/oauth/token');
				done();
			});

		});

		it('valid login should respond with 200 OK', (done) => {
			let options = {
				method : 'POST',
				url : '/oauth/login',
				payload : {username: 'user', password: 'password'}
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(200);
				expect(JSON.parse(response.payload).body.access_token)
						.toBe('254406f79c1999af65a7df4388971354f85cfee9');
				done();
			});
		});

	});

});
