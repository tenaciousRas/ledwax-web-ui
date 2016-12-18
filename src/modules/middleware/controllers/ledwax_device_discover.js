#!/usr/bin/env node
'use strict';

const _ = require('lodash');
const async = require('async');
const boom = require('boom');
const util = require('../../../util');

const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';
const ledwax_iot_config = require('../../../particle-config/iotdef_ledwax.json');
//map particle variable to handler method names
const particleDeviceVariableNames = ledwax_iot_config.particleDeviceVariableNames;
//map particle functions to handler method names
const particleDeviceFunctionNames = ledwax_iot_config.particleDeviceFunctionNames;
// get first (random-first) variable name
let signatureVarName = null;
for (var o in particleDeviceVariableNames) {
	if (particleDeviceVariableNames.hasOwnProperty(o) && typeof (o) !== 'function') {
		signatureVarName = o;
		break;
	}
}

/**
 * LedwaxDeviceDiscoverController controller
 */
const LedwaxDeviceDiscoverController = () => {

	/**
	 * Discover all LEDWax devices.  This requires getting all devices on the cloud,
	 * then querying each one for a given signature.  The signature currently used
	 * is a "name" attribute that starts with the token "ledwax", and the presence of a
	 * variable from the {@particleDeviceVariableNames}.
	 * TODO: use device attributes for version support
	 */
	const discoverLEDWaxDevices = (request, reply) => {
		const logTag = 'LedwaxDeviceDiscoverController#discoverLEDWaxDevices';
		let authToken = request.query.authtoken;
		let cloudId = request.query.particleCloudId;
		let particle = request.app.particle.api;
		const prom = particle.listDevices({
			auth : authToken
		});
		if (!prom) {
			return reply(boom.expectationFailed('unable to query cloud for particle devices - unknown error - '
				+ 'are you sure the cloud is up and running?'));
		}
		prom.then(
			(resp) => {
				let lwDvList = [];
				let devices = resp.body;
				request.server.log([ 'debug', logTag ],
					"device list from cloud: " + devices);
				async.eachOf(devices, (value, key, callback) => {
					let device = value;
					if (device.name && device.name.startsWith('ledwax')) {
						// it's probably a LEDWax device!
						request.server.log([ 'info', logTag ],
							'retrieving device variable from cloud for device:', device.id);
						try {
							let fnProm = particle.getVariable({
								deviceId : device.id,
								name : signatureVarName,
								auth : authToken
							});
							if (!fnProm) {
								let errMsg = 'unable to retrieve device variable from cloud for device:' + device.id;
								request.server.log([ 'warn', logTag ],
									errMsg);
								return callback(new Error(errMsg));
							}
							fnProm.then((data) => {
								lwDvList.push(device);
								callback();
							}, (err) => {
								// no error to keep looping
								return callback();
							});
						} catch (e) {
							return callback(e);
						}
					} else {
						callback();
					}
				}, (err) => {
					if (err) {
						request.server.log([ 'error', logTag ],
							'An error occurred while getting device signature:', err);
						if (lwDvList.length < 1) {
							return reply(boom.notFound(err, devices));
						}
					}
					return reply(lwDvList);
				});
			}, (err) => {
				request.server.log([ 'error', logTag ],
					'An error occurred while accessing cloud device list:', err);
				return reply(boom.expectationFailed(err));
			});
	};

	/**
	 * Discover capabilities for a single LEDWax device.  This requires verifying the device on the cloud
	 * by querying for all variables and functions.  Then all variables values are hydrated with 
	 * separate REST calls.
	 */
	const discoverLEDWaxDeviceCaps = (request, reply) => {
		const logTag = 'LedwaxDeviceDiscoverController#discoverLEDWaxDeviceCapabilities';
		let authToken = request.query.authtoken;
		let deviceId = request.query.deviceId;
		let particle = request.app.particle.api;
		const prom = particle.getDevice({
			deviceId : deviceId,
			auth : authToken
		});
		if (!prom) {
			return reply(boom.expectationFailed('unable to query cloud for device attributes - unknown error - '
				+ 'are you sure the cloud is up and running?'));
		}
		prom.then(
			(resp) => {
				let attrs = resp.body;
				request.server.log([ 'debug', logTag ],
					'Device attributes retrieved successfully: ' + JSON.stringify(attrs));
				if (!attrs.name || !attrs.name.startsWith('ledwax')) {
					let err = 'oops - somehow this doesn\'t appear to be a LEDWax device. The device ID is ' + attrs.id;
					request.server.log([ 'error', logTag ],
						err);
					return reply(boom.expectationFailed(err));
				}
				if (!attrs.variables && !attrs.functions.length < 1) {
					let err = 'oops - a LEDWax device was discovered with no capabilities. The device ID is ' + attrs.id;
					request.server.log([ 'error', logTag ],
						err);
					return reply(boom.expectationFailed(err));
				}
				// cache capabilities
				let caps = {
					dvcId : attrs.id,
					vrs : [],
					fns : []
				};
				// first handle functions since no REST call
				for (let i = 0; i < attrs.functions.length; i++) {
					caps.fns.push(attrs.functions[i]);
				}
				// handle variables with REST calls
				async.eachOf(attrs.variables, (value, key, callback) => {
					try {
						request.server.log([ 'info', logTag ],
							'retrieving device variable ' + key + ' from cloud for device:', attrs.id);
						let fnProm = particle.getVariable({
							deviceId : attrs.id,
							name : key,
							auth : authToken
						});
						if (!fnProm) {
							let errMsg = 'unable to retrieve device variable ' + key + ' from cloud for device:' + attrs.id;
							request.server.log([ 'warn', logTag ],
								errMsg);
							return callback(new Error(errMsg));
						}
						fnProm.then((data) => {
							caps.vrs.push(key);
							callback();
						}, (err) => {
							// no error to keep looping
							return callback();
						});
					} catch (e) {
						return callback(e);
					}
				}, (err) => {
					if (err) {
						request.server.log([ 'error', logTag ],
							'An error occurred while getting device capabilities: ', err);
						if (caps.vrs.length < 1 && caps.fns.length < 1) {
							return reply(boom.notFound(err, deviceId));
						}
					}
					return reply(caps);
				});
			}, (err) => {
				request.server.log([ 'error', logTag ],
					'An error occurred while getting device description:', err);
				return reply(boom.expectationFailed(err));
			});
	};

	// expose public methods
	let staticFns = {
		discoverLEDWaxDevices : discoverLEDWaxDevices,
		discoverLEDWaxDeviceCaps : discoverLEDWaxDeviceCaps
	};
	return staticFns;
};

module.exports = LedwaxDeviceDiscoverController();