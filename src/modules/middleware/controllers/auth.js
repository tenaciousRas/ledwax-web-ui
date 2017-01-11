#!/usr/bin/env node
'use strict';

const assert = require('assert');
const boom = require('boom');
const particlewrap = require('particle-api-js');
const util = require('../../../util');
const secure_random = require('secure-random');
const UserController = require('./user');

const DEFAULT_SESSION_TOKEN_LENGTH = 16;
const COOKIE_NAME = 'sessiontoken';

/**
 * Auth controller
 */
const AuthController = () => {

	const generateSessionToken = (tokenLength) => {
		if (typeof tokenLength != 'number' || tokenLength < 0) {
			tokenLength = DEFAULT_SESSION_TOKEN_LENGTH;
		}
		let ret = null;
		try {
			ret = secure_random(tokenLength);
		} catch (e) {
			console.log(e);
		}
		return ret;
	};

	/**
	 * Login to particle cloud via Particle api.
	 */
	const loginToCloud = (username, password, particle, log) => {
		log('info', 'AuthController#loginToCloud', 'particle call w/config : '
			+ JSON.stringify(particle));
		let promise = particle.login({
			username : username,
			password : password
		});
		return promise;
	};

	/**
	 * Authenticate a user against particle cloud.  If the user is authenticated, then 
	 * return the user's session token.  If no user exists then create a new user.  If no 
	 * session token exists then create a new one.
	 */
	const login = (request, reply) => {
		let un = request.payload.username;
		let cid = request.payload.particleCloudId;
		let particle = request.app.particle.api;
		let db = request.getDb('apidb');
		// logger delegate to pass to loginToCloud so it can be tested without request
		let logger = util.logDelegateFactory(request);
		// def promise outside try
		let prom;
		try {
			// get promise back
			prom = loginToCloud(un, request.payload.password, particle, logger);
		} catch (e) {
			// error
			request.server.log([ 'error', 'auth.contoller#login' ],
				'DB call complete - particle cloud login, exception =:' + reply.error);
			return reply(boom.badImplementation('unable to authenticate user against particle cloud', e));
		}
		if (!prom) {
			return reply(boom.expectationFailed('unable to authenticate user agsinst particle cloud'));
		}
		// handle particle login promise
		prom.then(
			(data) => {
				try {
					let authToken = data.body.access_token;
					request.server.log([ 'info', 'auth.contoller' ],
						'API call complete - promise success:\n' + authToken);
					let sessToken = generateSessionToken();
					sessToken = sessToken.join("");
					// attempt update
					let prom = UserController.updateDBUser(cid, un, sessToken, authToken, db, logger);
					prom.then((user) => {
						if (null == user) {
							let prom = UserController.createDBUser(cid, un, sessToken, authToken, db);
							prom.then(function(user) {
								request.server.log([ 'debug', 'auth.contoller#login' ],
									'response from createDBUser =:' + user);
								if (null == user) {
									// error
									request.server.log([ 'error', 'auth.contoller#login' ],
										'DB call complete - create user error');
									return reply(boom.badImplementation('unable to create user post-login'));
								} else {
									let result = {
										"userid" : user.id,
										"sessiontoken" : sessToken
									};
									return reply(result);
								}
							}, function(err) {
								return reply(boom.badImplementation('unable to create user post-login', err));
							});
						} else {
							let result = {
								"userid" : user.id,
								"sessiontoken" : sessToken
							};
							return reply(result);
						}
					}, (err) => {
						return reply(boom.unauthorized('unable to create user post-login', err));
					});
				} catch (e) {
					return reply(boom.unauthorized('there was an unexpected error', e));
				}
			},
			(err) => {
				request.server.log([ 'error', 'auth.contoller#login' ],
					'API call complete - promise error:\n' + err);
				return reply(boom.badImplementation(err));
			}
		);
	};

	/**
	 * De-authenticate a user from LEDWax session.  If the user is authenticated, then 
	 * delete the user's session token and delete all related web_user_auth_tokens.
	 */
	const logout = (request, reply) => {
		let cid = request.payload.particleCloudId;
		let ct = request.payload.sessiontoken;
		let particle = request.app.particle.api;
		let db = request.getDb('apidb');
		let webuser = db.getModel('webuser');
		let particleCloud = db.getModel('particle_cloud');
		let userPCAT = db.getModel('webuser_particle_cloud_auth_tokens');
		try {
			let cloudInstance = particleCloud.build({
				id : cid
			});
			webuser.findOne({
				where : {
					sessiontoken : ct
				},
				include : [
					{
						model : particleCloud,
						where : {
							id : cid
						}
					}
				]
			}).then((user) => {
				request.server.log([ 'error', 'auth.contoller#logout' ],
					'DB call complete - find promise success, user =:' + user);
				userPCAT.sequelize.transaction((t) => {
					return userPCAT.destroy({
						where : {
							webuserId : {
								$eq : user.id
							}
						},
						truncate : false
					}).then((delRes) => {
						return user.destroy({
							where : {
								sessiontoken : {
									$eq : ct
								}
							},
							truncate : false
						});
					});
				}).then((result) => {
					request.server.log([ 'error', 'auth.contoller#logout' ],
						'DB call complete - update+delete promise success, result=' + result);
					return reply({}).unstate(COOKIE_NAME);
				}).catch((err) => {
					return reply(boom.badImplementation('there was an unexpected transaction error', err));
				});
			});
		} catch (e) {
			return reply(boom.badImplementation('there was an unexpected error', e));
		}
	};

	// expose public methods
	return {
		login : login,
		logout : logout
	};
};

module.exports = AuthController();