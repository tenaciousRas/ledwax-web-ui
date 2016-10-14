'use strict';

const assert = require('assert');
const boom = require('boom');
const particle = require('particle-api-js');

/**
 * Auth controller
 */
function AuthController() {

	return {
		list : list,
		update : update,
		login : login
	};

	function loginToCloud(username, password) {
		var promise = particle.login({username: username, password: password});
		return promise;
	}

	/**
	 * Authenticate a user.
	 */
	function login(request, reply) {
		if (typeof request === 'undefined' || !request
				|| typeof request.payload === 'undefined' || !request.payload) {
			return reply(boom.badData('invalid request params'));
		}
		var un = request.payload.username;
		var pwd = request.payload.password;
		var prom;
		try {
			prom = loginToCloud(un, pwd);
		} catch (e) {
		}
		if (!prom) {
			return reply(boom.expectationFailed(err));
		}
		prom.then(
		  function(data){
		    console.log('API call completed on promise resolve: ', data.body.access_token);
				return reply(data);
		  },
		  function(err) {
		    console.log('API call completed on promise fail: ', err);
				return reply(boom.expectationFailed(err));
		  }
		);
	}

	/**
	 * Returns an array of all users
	 */
	function list(request, reply) {
		// var UserModel = mongoose.model('User');
		// UserModel.find({}, function(err, data) {
		// 	return reply(data);
		// });
		var select = 'SELECT * FROM storedusertokens';
	  request.pg.client.query(select, function(err, result) {
			if (err) return reply(err);
			if (!result) return reply({rows: []});
	    return reply(result.rows[0]);
	  });
	}

	/**
	 * Updates a single user
	 */
	function update(request, reply) {
		// var UserModel = mongoose.model('User');
		// var user = new UserModel(request.payload);
		// user.save(function(err) {
		// 	if (err) {
		// 		return reply(boom.badImplementation(
		// 				'There was an internal error', err));
		// 	}
		//
		// 	return reply(user);
		// });
		var update = 'UPDATE StoredUserTokens WHERE data = $1';
		var params = [request.payload];
	  request.pg.client.update(update, params, function(err, result) {
	    console.log(err, result);
			if(err) return reply(err);
			if (!result) return reply({rows: []});
	    return reply(result.rows[0]);
	  });
	}

};

module.exports = AuthController();
