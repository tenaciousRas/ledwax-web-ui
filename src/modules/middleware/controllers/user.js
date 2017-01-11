#!/usr/bin/env node
'use strict';

const assert = require('assert');
const boom = require('boom');
const Q = require('q');
const util = require('../../../util')

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
		try {
			let prom = createDBUser(cid, un, ct, at, db);
			prom.then((user) => {
				return reply(user);
			}, (err) => {
				throw new Error(err);
			});
		} catch (e) {
			request.server.log([ 'error', 'user.contoller#create' ],
				'DB call complete - create user error, exception =:' + e);
			return reply(boom.badImplementation('unable to create user', e));
		}
	};

	/**
	 * Create a new user in DB.
	 */
	const createDBUser = (cloudid, username, sessiontoken, authtoken, db) => {
		let webuser = db.getModel('webuser');
		let particleCloud = db.getModel('particle_cloud');
		let vals = {
			username : username,
			sessiontoken : sessiontoken
		};
		particleCloud = particleCloud.build({
			id : cloudid
		});
		webuser = webuser.build(vals);
		webuser.addParticle_cloud([ particleCloud ], {
			authtoken : authtoken
		});
		return webuser.save();
	};

	/**
	 * Updates a user's sessiontoken and authtoken given username, cloudId, authtoken and sessiontoken.
	 */
	const update = (request, reply) => {
		let at = request.payload.authtoken;
		let ct = request.payload.sessiontoken;
		let un = request.payload.username;
		let cid = request.payload.cloudid;
		let db = request.getDb('apidb');
		let log = util.logDelegateFactory(request);
		try {
			let prom = updateDBUser(cid, un, ct, at, db, log);
			prom.then((user) => {
				if (null == user) {
					return reply(boom.notFound(at));
				}
				return reply(user);
			}, (err) => {
				throw new Error(err);
			});
		} catch (e) {
			return reply(boom.badImplementation('unable to update user', e));
		}
	};

	/**
	 * Update user in DB.
	 */
	const updateDBUser = (cloudid, username, sessiontoken, authtoken, db, log) => {
		let deferred = Q.defer();
		let webuser = db.getModel('webuser');
		let particleCloud = db.getModel('particle_cloud');
		let cloudInstance = particleCloud.build({
			id : cloudid
		});
		webuser.findOne({
			where : {
				username : username
			},
			include : [
				{
					model : particleCloud,
					where : {
						id : cloudid
					}
				}
			]
		}).then((user) => {
			if (null == user) {
				return deferred.resolve(null);
			}
			user.sequelize.transaction((t) => {
				log('debug', 'user.contoller#update',
					'DB call complete - find promise success, user =:' + user);
				user.sessiontoken = sessiontoken;
				user.addParticle_cloud([ cloudInstance ], {
					authtoken : authtoken
				});
				return user.save({
					fields : [ 'sessiontoken' ]
				});
			}).then((result) => {
				log('debug', 'user.contoller#update',
					'DB call complete - update promise success, user =:' + result);
				deferred.resolve(result);
			}, (err) => {
				deferred.reject(err);
			});
		});
		return deferred.promise;
	}

	return {
		findAuth : retrieveByAuthToken,
		find : retrieveBySession,
		create : create,
		createDBUser : createDBUser,
		update : update,
		updateDBUser : updateDBUser,
	};

};

module.exports = UserController();