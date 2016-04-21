describe('api', function(){

	var server;

	beforeAll(function(done){
		server = require('../mockserver.js').createServer(done);
	});

	describe('auth controller', function(){

		it('invalid login should respond with 200 OK', function(done){
			var options = {
				method: 'GET',
				url: '/oauth/login'
			};
			
			server.inject(options, function(response){
				expect(response.statusCode).toBe(200);
				done();
			});
		});

		it('invalid login should respond with 200 OK', function(done){
			var options = {
				method: 'GET',
				url: '/oauth/login'
			};
			
			server.inject(options, function(response){
				expect(response.statusCode).toBe(200);
				done();
			});
		});

		it('valid login should respond with 200 OK', function(done){
			var options = {
				method: 'GET',
				url: '/oauth/login'
			};
			
			server.inject(options, function(response){
				expect(response.statusCode).toBe(200);
				done();
			});
		});

	});

});