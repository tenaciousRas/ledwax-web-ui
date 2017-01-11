#!/usr/bin/env node
'use strict';

const assert = require('assert');
const boom = require('boom');
const particlewrap = require('particle-api-js');
const util = require('../../../util');
const secure_random = require('secure-random');
const UserController = require('./user');

const DEFAULT_SESSION_TOKEN_LENGTH = 16;

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
			return reply(boom.badImplementation('unable to authenticate user against particle cloud', e)).unstate('cookietoken');
		}
		if (!prom) {
			return reply(boom.expectationFailed('unable to authenticate user agsinst particle cloud')).unstate('cookietoken');
		}
		// handle particle login promise
		prom.then(
			(data) => {
				request.server.log([ 'info', 'auth.contoller' ],
					'API call complete - promise success:\n' + data.body.access_token);
				try {
					let sessToken = generateSessionToken();
					sessToken = sessToken.join("");
					// attempt update
					let prom = UserController.updateDBUser(cid, un, sessToken, sessToken, db, logger);
					prom.then((user) => {
						if (null == user) {
							let prom = UserController.createDBUser(cid, un, sessToken, sessToken, db);
							prom.then(function(user) {
								request.server.log([ 'debug', 'auth.contoller#login' ],
									'response from createDBUser =:' + user);
								if (null == user) {
									// error
									request.server.log([ 'error', 'auth.contoller#login' ],
										'DB call complete - create user error, exception =:' + reply.error);
									return reply(boom.badImplementation('unable to create user post-login', e)).unstate('cookietoken');
								} else {
									let result = {
										"userid" : user.id,
										"sessiontoken" : sessToken
									};
									return reply(result);
								}
							}, function(err) {
								return reply(boom.badImplementation('unable to create user post-login', err)).unstate('cookietoken');
							});
						} else {
							let result = {
								"userid" : user.id,
								"sessiontoken" : sessToken
							};
							return reply(result);
						}
					}, (err) => {
						return reply(boom.unauthorized('unable to create user post-login', err)).unstate('cookietoken');
					});
				} catch (e) {
					return reply(boom.unauthorized('there was an unexpected error', e)).unstate('cookietoken');
				}
			},
			(err) => {
				request.server.log([ 'error', 'auth.contoller' ],
					'API call complete - promise error:\n' + err);
				return reply(boom.unauthorized(err)).unstate('sessiontoken');
			}
		);
	};

	// expose public methods
	return {
		login : login
	};
};

module.exports = AuthController();