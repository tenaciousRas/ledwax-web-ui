var mongoose = require('mongoose');

describe('api', function() {

	var server;

	beforeAll(function(done) {
		server = require('../mockserver.js').createServer(done);
		db = mongoose.connection;
		db.collection.remove({});
	});

	describe('auth controller', function() {

		it('invalid login should respond with 200 OK', function(done) {
			var options = {
				method : 'POST',
				url : '/oauth/login',
				payload : {name: 'foo', password: 'bar'}
			};

			server.inject(options, function(response) {
				expect(response.statusCode).toBe(200);
				expect(response.payload).toBe('');
				done();
			});
		});

		it('invalid login should respond with 200 OK', function(done) {
			var options = {
				method : 'GET',
				url : '/oauth/login'
			};

			server.inject(options, function(response) {
				expect(response.statusCode).toBe(200);
				expect(response.payload).toBe('');
				done();
			});
		});

	});

});