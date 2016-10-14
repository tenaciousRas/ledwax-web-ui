'use strict';

const assert = require('assert');
var pg = require('pg');
const boom = require('boom');

describe('api', function() {

	var server;
	var db;

	beforeAll(function(done) {
		server = require('../mockserver.js').createServer();
		db = server.db;
		db.on('drain', db.end.bind(db)); //disconnect client when all queries are finished
    db.connect();
		var select = escape('DELETE FROM user');
	  db.query(select, (err, result) => {
	 		assert(err, 'mockserver' + ' :: ERROR Connecting during run-once to PostgreSQL!\n' + err);
	    server.log(['info', 'auth.contoller.spec'], 'deleted db rows -- ' + result);
	  });
		done();
	});

	describe('auth controller', () => {

		it('empty login should respond with 400 NOT OK', (done) => {
			var options = {
				method : 'GET',
				url : '/oauth/login'
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(response.payload).toBe('{"statusCode":422,"error":"Unprocessable Entity","message":"invalid request params"}');
				done();
			});
		});

		it('invalid login should respond with 400 NOT OK', (done) => {
			var options = {
				method : 'POST',
				url : '/oauth/login',
				payload : {name: 'foo', password: 'bar'}
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(500);
				expect(response.payload).toBe('{"statusCode":500,"error":"Internal Server Error","message":"An internal server error occurred"}');
				done();
			});
		});

	});

});
