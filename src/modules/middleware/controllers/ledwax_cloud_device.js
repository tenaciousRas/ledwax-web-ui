#!/usr/bin/env node
'use strict';

const boom = require('boom');
const particlewrap = require('particle-api-js');

const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';
const particle_config = require('../../../particle-config').attributes[rt_ctx_env];
let particle = new particlewrap(particle_config);

/**
 * Auth controller
 */
const LedwaxCloudDeviceController = () => {

	/**
	 * Returns a list of devices registered with the particle cloud.
	 */
	const retrieveStoredDevices = (request, reply) => {
		let particleCloudId = request.payload ? request.payload.particleCloudId : request.query.particleCloudId;
    let db = request.getDb('apidb');
    let ledwaxDevice = db.getModel('ledwax_device');
    try {
      ledwaxDevice.find({
        where: {particleCloudId: particleCloudId},
			}).then((devices) => {
  	    	request.server.log(['debug', 'LedwaxCloudDeviceController#retrieveStoredDevices'],
  						'DB call complete - promise success, devices =:' + devices);
          if (null == devices) {
            return reply({});
          }
  				return reply(devices);
        });
    } catch (e) {
      return reply(boom.badImplementation('exception while executing find devices: ', e));
    }
	}

	// expose public methods
	return {
		retrieveStoredDevices : retrieveStoredDevices
	};

};

module.exports = LedwaxCloudDeviceController();
