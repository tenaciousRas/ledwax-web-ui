#!/usr/bin/env node
'use strict';

const assert = require('assert');
let pg = require('pg');
const boom = require('boom');

describe('api', () => {

	let server,
		db,
		particleConfig;

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
				expect(JSON.parse(response.payload).message).toBe('Error: child "sessiontoken" fails because ["sessiontoken" is required]');
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
				expect(JSON.parse(response.payload).message).toBe('Error: child "sessiontoken" fails because ["sessiontoken" is required]');
				done();
			});
		});

		it('returns 404 not found when webuser table is empty', (done) => {
			let options = {
				method : 'GET',
				url : '/users/find?sessiontoken=foobar'
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(404);
				expect(JSON.parse(response.payload).message).toBe('foobar');
				done();
			});
		});

		it('returns sessiontoken when user doesn\'t exist in webuser table by sessiontoken', (done) => {
			let options = {
				method : 'GET',
				url : '/users/find?sessiontoken=foobar'
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(404);
				expect(JSON.parse(response.payload).message).toBe('foobar');
				done();
			});
		});

		it('returns user that exists in webuser table by sessiontoken', (done) => {
			let db = server.plugins['hapi-sequelize']['apidb'];
			let webuser = db.getModel('webuser');
			let expectedToken = "234234234";
			webuser.create({
				username : 'foo',
				sessiontoken : expectedToken
			})
				.then(function(webuser) {
					let options = {
						method : 'GET',
						url : '/users/find?sessiontoken=234234234'
					};

					server.inject(options, (response) => {
						expect(response.statusCode).toBe(200);
						expect(JSON.parse(response.payload).sessiontoken).toBe(expectedToken);
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
				expect(JSON.parse(response.payload).error).toBe('Unprocessable Entity');
				done();
			});
		});

		it('missing params responds with 422 NOT OK', (done) => {
			let options = {};
			let parmNames = [ 'username', 'password', 'authtoken', 'sessiontoken' ];
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
			let particleCloud = db.getModel('particle_cloud');
			let webuser = db.getModel('webuser');
			db.getModel('webuser_particle_cloud_auth_tokens').destroy({
				truncate : true //ignore where and truncate the table instead
			}).then((affectedRows) => {
				// http://docs.sequelizejs.com/en/latest/docs/querying/#operators
				webuser.destroy({
					where : {
						id : {
							$gt : 0
						}
					},
					truncate : false // cannot truncate table ref'd by foreign key
				}).then((affectedRows) => {
					// insert new cloud
					let vals = {
						name : 'testfoo',
						ip : 'address.ip',
						port : 20000
					};
					particleCloud.build(vals).save().then((newCloud) => {
						// make request
						let options = {
							method : 'POST',
							url : '/users/create',
							payload : {
								username : 'foo',
								cloudid : newCloud.id,
								authtoken : 'authtoken_foobar',
								sessiontoken : 'quux'
							}
						};

						server.inject(options, (response) => {
							expect(response.statusCode).toBe(200);
							if (response.statusCode == 200) {
								webuser.findOne({
									where : {
										username : options.payload.username
									},
									include : [
										{
											model : particleCloud,
											where : {
												id : newCloud.id
											}
										}
									]
								}).then((user) => {
									expect(user.sessiontoken).toBe('quux');
									done();
								});
							} else {
								done();
							}
						});
					});
				});
			});
		});
	});

	describe('user controller update', () => {

		it('empty params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/users/update',
				payload : {}
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(JSON.parse(response.payload).error).toBe('Unprocessable Entity');
				done();
			});
		});

		it('missing params responds with 422 NOT OK', (done) => {
			let options = {};
			let parmNames = [ 'username', 'password', 'authtoken', 'sessiontoken' ];
			for (let i = 0; i < parmNames.length; i++) {
				let jsObj = {};
				jsObj[parmNames[i]] == 'foo';
				options = {
					method : 'POST',
					url : '/users/update',
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

		it('valid update responds with 200 OK', (done) => {
			// delete all users
			let db = server.plugins['hapi-sequelize']['apidb'];
			let particleCloud = db.getModel('particle_cloud');
			let webuser = db.getModel('webuser');
			db.getModel('webuser_particle_cloud_auth_tokens').destroy({
				truncate : true //ignore where and truncate the table instead
			}).then((affectedRows) => {
				// http://docs.sequelizejs.com/en/latest/docs/querying/#operators
				webuser.destroy({
					where : {
						id : {
							$gt : 0
						}
					},
					truncate : false // cannot truncate table ref'd by foreign key
				}).then((affectedRows) => {
					// insert new cloud
					let vals = {
						name : 'testfoo',
						ip : 'address.ip',
						port : 20000
					};
					particleCloud.build(vals).save().then((newCloud) => {
						let vals = {
							username : 'foofoo',
							cloudid : newCloud.id,
							sessiontoken : 'qux'
						};
						webuser = webuser.build(vals);
						webuser.addParticle_cloud([ newCloud ], {
							authtoken : 'authtoken_foobar'
						});
						webuser.save().then((user) => {
							// make request
							let options = {
								method : 'POST',
								url : '/users/update',
								payload : {
									username : 'foofoo',
									cloudid : newCloud.id,
									authtoken : 'authtoken_foobar',
									sessiontoken : 'corge'
								}
							};
							// make request
							server.inject(options, (response) => {
								expect(response.statusCode).toBe(200);
								if (response.statusCode == 200) {
									let pl = JSON.parse(response.payload);
									expect(pl.sessiontoken).toBe(options.payload.sessiontoken);
									expect(pl.particle_clouds[0].webuser_particle_cloud_auth_tokens.authtoken).toBe(options.payload.authtoken);
									// reset webuser from instance -> model
									webuser = db.getModel('webuser');
									webuser.findOne({
										where : {
											id : pl.id
										},
									}).then((user) => {
										expect(user.username).toBe(vals.username);
										expect(user.sessiontoken).toBe(options.payload.sessiontoken);
										done();
									});
								} else {
									done();
								}
							});
						});
					});
				});
			});
		});
	});

});