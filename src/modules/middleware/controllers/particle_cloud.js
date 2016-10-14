'use strict';

const Boom = require('boom');
const Particle = require('particle-api-js');

/**
 * Particle Cloud controller
 */
function ParticleCloudController() {

	return {
		loginToCloud : loginToCloud
	};

	function loginToCloud(username, password) {
		particle.login({username: username, password: password}).then(
		  function(data){
		    console.log('API call completed on promise resolve: ', data.body.access_token);
		  },
		  function(err) {
		    console.log('API call completed on promise fail: ', err);
		  }
		);
	}

};

module.exports = ParticleCloudController();
