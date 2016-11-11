#!/usr/bin/env node
'use strict';

const assert = require('assert');
const boom = require('boom');
const particlewrap = require('particle-api-js');
const util = require('../../../util');

const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';
const particle_config = require('../../../particle-config').attributes[rt_ctx_env];
let particle = new particlewrap(particle_config);

const user_controller = require('./user');
const secure_random = require('secure-random');

const DEFAULT_SESSION_TOKEN_LENGTH = 16;

/**
 * Auth controller
 */
const AuthController = () => {

	const generateSessionToken = (tokenLength) => {
		if (typeof tokenLength != 'number' || tokenLength < 0) {
			tokenLength = DEFAULT_SESSION_TOKEN_LENGTH;
		}
		return secure_random.secureRandom(tokenLength);
	};

	/**
	 * Login to particle cloud via Particle api.
	 */
	const loginToCloud = (username, password, log) => {
		log('info', 'AuthController#loginToCloud', 'particle call w/config : ' + particle_config);
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
		let cid = request.payload.cloudid;
		let prom;
		// logger delegate to pass to loginToCloud so it can be tested without request
		let logger = util.logDelegateFactory(request);
		try {
			// get promise back
			prom = loginToCloud(un, request.payload.password, logger);
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
				request.server.log([ 'info', 'auth.contoller' ],
					'API call complete - promise success:\n' + data.body.access_token);
				let sessToken = generateSessionToken();
				request.payload.sessiontoken = sessToken;
				request.payload.authtoken = data.body.access_token;
				request.payload.username = un;
				request.payload.cloudid = cid;
				let tRep = user_controller.update(request, reply);
				if (tRep.code == 404) {
					// create new user
					tRep = user_controller.create(request, reply);
					if (tRep.code != 200) {
						// error
						request.server.log([ 'error', 'auth.contoller#login' ],
							'DB call complete - create user error, exception =:' + reply.error);
						return reply(boom.badImplementation('unable to create user post-login', reply.error));
					}
				}
				return reply({
					"cookietoken" : sessToken.quote()
				});
			},
			(err) => {
				request.server.log([ 'error', 'auth.contoller' ],
					'API call complete - promise error:\n' + err);
				return reply(boom.expectationFailed(err));
			}
		);
	};

	// expose public methods
	return {
		login : login
	};
};

module.exports = AuthController();