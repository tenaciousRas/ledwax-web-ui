'use strict';

var mongoose = require('mongoose'), Boom = require('boom');

/**
 * Auth controller
 */
function AuthController() {

	return {
		list : list,
		update : update
	};

	/**
	 * Returns an array of all users
	 */
	function list(request, reply) {
		var UserModel = mongoose.model('User');
		UserModel.find({}, function(err, data) {
			return reply(data);
		});
	}

	/**
	 * Updates a single user
	 */
	function update(request, reply) {
		var UserModel = mongoose.model('User');
		var user = new UserModel(request.payload);
		user.save(function(err) {
			if (err) {
				return reply(Boom.badImplementation(
						'There was an internal error', err));
			}

			return reply(user);
		});
	}

};

module.exports = AuthController();
