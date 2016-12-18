#!/usr/bin/env node
'use strict';

const boom = require('boom');
const util = require('../../../util');
const particlewrap = require('particle-api-js');

/**
 * Config controller
 */
function ConfigController() {

	/**
	 * Return application configuration.
	 */
	const getConfig = (request, reply) => {
		let ret = {};
		let db = request.getDb('apidb');
		let cloud = db.getModel('particle_cloud');
		try {
			cloud.findAll({
				where : {
					id : {
						$gt : 0
					}
				},
				attributes : {
					exclude : [ 'client_secret', 'client_id', 'token_duration' ]
				}
			}).then((clouds) => {
				request.server.log([ 'debug', 'config.contoller' ],
					'DB call complete - promise success, clouds =:' + clouds);
				if (null == clouds || clouds.length < 1) {
					return reply(boom.notFound('no cloud records found'));
				}
				return reply({
					"cloudHosts" : clouds
				});
			});
		} catch (e) {
			return reply(boom.badImplementation('unable to find clouds', e));
		}
	}

	// expose public methods
	return {
		getConfig : getConfig
	};

}
;

module.exports = ConfigController();