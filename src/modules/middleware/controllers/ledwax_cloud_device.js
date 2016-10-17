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
const LedwaxCloudDeviceController = () {

	/**
	 * Returns a list of devices registered with the particle cloud.
	 */
	const retrieveStoredDevices = (request, reply) => {
		let ct = request.payload ? request.payload.cookietoken : request.query.cookietoken;
    let db = request.getDb('apidb');
    let ledwaxDevice = db.getModel('ledwax_device');
    try {
      ledwaxDevice.find({
        where: {deviceId: deviceId},
        }).then((user) => {
  	    	request.server.log(['debug', 'user.contoller'],
  						'DB call complete - promise success, user =:' + user);
          if (null == user) {
            return reply(boom.notFound(ct));
          }
  				return reply(user);
        });
    } catch (e) {
      return reply(boom.badImplementation('unable to find user', e));
    }

		var token = request.payload.token;
		var devicesPr = particle.listDevices({ auth: token });

		devicesPr.then(
		  (devices) => {
		  	server.log(['info', 'ParticleDevicesController#deviceList'], 'Devices: ', devices);
	    	return reply(data);
		  },
		  (err) => {
		  	server.log(['info', 'LedwaxDeviceController#getNumStrips'], 'List particle cloud devices call failed: ', err);
	    	return reply(err);
		  }
		);
	}

	// expose public methods
	return {
		listDevices : cloudDeviceList,
		deviceFn : cloudDeviceFunction,
		sendSignal : signalDevice,
		deviceAttrs : cloudDeviceAttrs,
		deviceVar : cloudDeviceVar
	};

};

module.exports = ParticleDevicesController();
