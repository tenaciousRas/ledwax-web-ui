#!/usr/bin/env node
'use strict';

const LedWaxPersistence = () {
	/**
	 * Persist a new user login to database.
	 */
	const persistLogin = (username, password, authtoken, log) => {
	  log('particle call w/config : ' + particle_config);
		let promise = particle.login({username: username, password: password});
		return promise;
	};

	// expose public methods
	return {
		persistLogin : persistLogin
	};

};
module.exports = LedWaxPersistence();
