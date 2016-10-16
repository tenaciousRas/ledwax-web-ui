#!/usr/bin/env node
'use strict';

const assert = require('assert');
let pg = require('pg');
const boom = require('boom');

describe('api', () => {

	let server, db, particleConfig;

	beforeAll((done) => {
		server = require('../mockserver.js').createServer();
		particleConfig = server.methods.particle.config();
    // https://github.com/hapijs/hapi/issues/3017
    setTimeout(done, 1000);
	});

	describe('user controller find', () => {

		it('empty params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/users/find'
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(JSON.parse(response.payload).message).toBe('Error: child "cookietoken" fails because ["cookietoken" is required]');
				done();
			});
		});

		it('invalid params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/users/find?foo=bar'
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(JSON.parse(response.payload).message).toBe('Error: child "cookietoken" fails because ["cookietoken" is required]');
				done();
			});
		});

		it('returns 404 not found when storeduser_tokens table is empty', (done) => {
			let options = {
				method : 'GET',
				url : '/users/find?cookietoken=foobar'
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(404);
				expect(JSON.parse(response.payload).message).toBe('foobar');
				done();
			});
		});

		it('returns cookietoken when user doesn\'t exist in storeduser_tokens table by cookietoken', (done) => {
			let options = {
				method : 'GET',
				url : '/users/find?cookietoken=foobar'
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(404);
				expect(JSON.parse(response.payload).message).toBe('foobar');
				done();
			});
		});

		it('returns user that exists in storeduser_tokens table by cookietoken', (done) => {
      let db = server.plugins['hapi-sequelize']['apidb'];
      let stuser = db.getModel('storeduser_tokens');
      let expectedToken = "234234234";
      stuser.create({ username: 'foo', pwd: 'bar', authtoken: 'baz', cookietoken: expectedToken })
          .then(function(stuser) {
      			let options = {
      				method : 'GET',
      				url : '/users/find?cookietoken=234234234'
      			};

      			server.inject(options, (response) => {
      				expect(response.statusCode).toBe(200);
      				expect(JSON.parse(response.payload).authtoken).toBe('baz');
      				expect(JSON.parse(response.payload).cookietoken).toBe(expectedToken);
      				done();
      			});
          });
		});

	});

	describe('user controller create', () => {

		it('empty params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/users/create',
        payload : {}
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(JSON.parse(response.payload).message).toBe('Error: child "username" fails because ["username" is required]');
				done();
			});
		});

		it('missing params responds with 422 NOT OK', (done) => {
      let options = {};
      let parmNames = ['username', 'password', 'authtoken', 'cookietoken'];
      for (let i = 0; i < parmNames.length; i++) {
        let jsObj = {};
        jsObj[parmNames[i]] == 'foo';
  			options = {
  				method : 'POST',
  				url : '/users/create',
  				payload : jsObj
  			};
  			server.inject(options, (response) => {
  				expect(response.statusCode).toBe(422);
          if (i == (parmNames.length - 1)) {
  				  done();
          }
  			});
      }
		});

		it('valid insert responds with 200 OK', (done) => {
      // delete all users
      let db = server.plugins['hapi-sequelize']['apidb'];
      let stuser = db.getModel('storeduser_tokens');
      stuser.destroy({
        where: {
          username: 'foo'
        },
        truncate: false  //ignore where and truncate the table instead
      }).then((affectedRows) => {
        // make request
  			let options = {
  				method : 'POST',
  				url : '/users/create',
          payload : {username: 'foo', password: 'bar', authtoken: 'baz', cookietoken: 'quux'}
  			};

  			server.inject(options, (response) => {
  				expect(response.statusCode).toBe(200);
//  				expect(JSON.parse(response.payload).message).toBe('bah');
          // stuser.findOne({
          //   where: {cookietoken: ct},
          //   }).then((user) => {
  				//     expect(user).toBe('humbug');
  				    done();
          //   });
  			});
      });
		});

	});

});
