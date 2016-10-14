'use strict';

const Boom = require('boom');
const Particle = require('particle-api-js');
const DeviceController = require('cloud-devices');

/**
 * LedwaxDevice controller
 */
function LedwaxDeviceController() {

	return {
	};

	function getNumStrips(request, reply) {
    var token = request.payload.auth;
    var deviceId = request.payload.deviceId;
    var varname = 'numStrips';
    var request = {token: token, reply: reply};
    DeviceController.cloudDeviceVar(request, reply);
	}

};

module.exports = LedwaxDeviceController();
