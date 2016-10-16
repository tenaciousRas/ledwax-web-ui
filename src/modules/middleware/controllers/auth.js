#!/usr/bin/env node
'use strict';

const assert = require('assert');
const boom = require('boom');
const particlewrap = require('particle-api-js');

const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';
const particle_config = require('../../../particle-config').attributes[rt_ctx_env];
let particle = new particlewrap(particle_config);

/**
 * Auth controller
 */
const AuthController = () => {

	const loginToCloud = (username, password, log) => {
	  log('particle call w/config : ' + particle_config);
		let promise = particle.login({username: username, password: password});
		return promise;
	};

	/**
	 * Authenticate a user.
	 */
	const login = (request, reply) => {
		let un = request.payload.username;
		let pwd = request.payload.password;
		let prom;
		try {
			let logger = (msg) => { request.server.log(['info', 'AuthController#loginToCloud'], msg); };
			prom = loginToCloud(un, pwd, logger);
		} catch (e) {
		}
		if (!prom) {
			return reply(boom.expectationFailed(err));
		}
		prom.then(
		  (data) => {
	    	request.server.log(['info', 'auth.contoller'],
						'API call complete - promise success:\n' + data.body.access_token);
				return reply(data);
		  },
		  (err) => {
	    	request.server.log(['info', 'auth.contoller'],
						'API call complete - promise error:\n' + err);
				return reply(boom.expectationFailed(err));
		  }
		);
	};

	return {
		login: login
	};
};

module.exports = AuthController();
