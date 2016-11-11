#!/usr/bin/env node
'use strict';

const assert = require('assert');
const boom = require('boom');

/**
 * User controller to manage locally stored users.
 */
const UserController = () => {

	/**
	 * Returns a user given username, auth token, and cloud id
	 */
	const retrieveByAuthToken = (request, reply) => {
		let un = request.payload.username;
		let at = request.payload ? request.payload.authtoken : request.query.authtoken;
		let cid = request.payload.cloudid;
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
					username : un
				},
				include : [
					{
						model : particleCloud,
						where : {
							id : cid
						}
					}, {
						model : userPCAT,
						where : {
							authtoken : at
						}
					}
				]
			}).then((user) => {
				if (null == user) {
					return reply(boom.notFound(ct));
				}
				return reply(user);
			});
		} catch (e) {
			return reply(boom.badImplementation('unable to find user by authtoken', e));
		}
	};

	/**
	 * Returns a user given session token
	 */
	const retrieveBySession = (request, reply) => {
		let ct = request.payload ? request.payload.sessiontoken : request.query.sessiontoken;
		let db = request.getDb('apidb');
		let webuser = db.getModel('webuser');
		try {
			webuser.findOne({
				where : {
					sessiontoken : ct
				},
			}).then((user) => {
				request.server.log([ 'debug', 'user.contoller' ],
					'DB call complete - promise success, user =:' + user);
				if (null == user) {
					return reply(boom.notFound(ct));
				}
				return reply(user);
			});
		} catch (e) {
			return reply(boom.badImplementation('unable to find user by session token', e));
		}
	};

	/**
	 * Create a new user in the DB.
	 */
	const create = (request, reply) => {
		let at = request.payload.authtoken;
		let ct = request.payload.sessiontoken;
		let un = request.payload.username;
		let cid = request.payload.cloudid;
		let db = request.getDb('apidb');
		let webuser = db.getModel('webuser');
		let particleCloud = db.getModel('particle_cloud');
		let vals = {
			username : request.payload.username,
			sessiontoken : ct
		};
		try {
			particleCloud = particleCloud.build({
				id : cid
			});
			webuser = webuser.build(vals);
			webuser.addParticle_cloud([ particleCloud ], {
				authtoken : at
			});
			webuser.save().then((user) => {
				return reply(user);
			});
		} catch (e) {
			request.server.log([ 'error', 'user.contoller#create' ],
				'DB call complete - create user error, exception =:' + e);
			return reply(boom.badImplementation('unable to create user', e));
		}
	};

	/**
	 * Updates a user's sessiontoken and authtoken given username, cloudId, authtoken and sessiontoken.
	 */
	const update = (request, reply) => {
		let ct = request.payload.sessiontoken;
		let at = request.payload.authtoken;
		let un = request.payload.username;
		let cid = request.payload.cloudid;
		let db = request.getDb('apidb');
		let webuser = db.getModel('webuser');
		let particleCloud = db.getModel('particle_cloud');
		try {
			let cloudInstance = particleCloud.build({
				id : cid
			});
			webuser.findOne({
				where : {
					username : un
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
				if (null == user) {
					return reply(boom.notFound(at));
				}
				user.sequelize.transaction((t) => {
					request.server.log([ 'debug', 'user.contoller#update' ],
						'DB call complete - find promise success, user =:' + user);
					user.sessiontoken = ct;
					user.addParticle_cloud([ cloudInstance ], {
						authtoken : at
					});
					return user.save({
						fields : [ 'sessiontoken' ]
					});
				}).then((result) => {
					request.server.log([ 'debug', 'user.contoller#update' ],
						'DB call complete - update promise success, user =:' + result);
					return reply(result);
				});
			});
		} catch (e) {
			return reply(boom.badImplementation('unable to update user', e));
		}
	};

	return {
		findAuth : retrieveByAuthToken,
		find : retrieveBySession,
		insert : create,
		update : update
	};

};

module.exports = UserController();