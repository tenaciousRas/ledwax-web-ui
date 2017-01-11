#!/usr/bin/env node
'use strict';

const boom = require('boom');

/**
 * Auth controller
 */
function ParticleDevicesController() {

	/**
	 * Returns a list of devices registered with the particle cloud.
	 */
	const cloudDeviceList = (request, reply) => {
		let authToken = request.auth.credentials.authtoken;
		let particle = request.app.particle.api;
		let devicesPr = particle.listDevices({
			auth : authToken
		});
		devicesPr.then(
			(devices) => {
				request.server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'Devices: ', devices);
				return reply(data);
			},
			(err) => {
				server.log([ 'info', 'LedwaxDeviceController#getNumStrips' ], 'List particle cloud devices call failed: ', err);
				return reply(err);
			}
		);
	}

	/**
	 * Calls a function on a device connected to the cloud.
	 */
	const cloudDeviceFunction = (request, reply) => {
		let deviceId = request.payload.deviceId,
			fn = request.payload.fn,
			arg = request.payload.arg;
		let authToken = request.auth.credentials.authtoken;
		let particle = request.app.particle.api;
		let fnPr = particle.callFunction({
			deviceId : deviceId,
			name : fn,
			argument : arg,
			auth : authToken
		});
		fnPr.then(
			(data) => {
				request.server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'Function called succesfully:', data);
				return reply(data);
			}, (err) => {
				request.server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'An error occurred:', err);
				return reply(err);
			}
		);
	}

	/**
	 * Returns a list of attributes for a given device.
	 */
	const cloudDeviceAttrs = (request, reply) => {
		let deviceId = request.payload.deviceId;
		let authToken = request.auth.credentials.authtoken;
		let particle = request.app.particle.api;
		let devicesPr = particle.getDevice({
			deviceId : deviceId,
			auth : authToken
		});
		devicesPr.then(
			(data) => {
				request.server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'Device attrs retrieved successfully:', data);
				return reply(data);
			},
			(err) => {
				request.server.log([ 'error', 'ParticleDevicesController#deviceList' ], 'API call failed: ', err);
				return reply(boom.badImplementation(err));
			}
		);
	}

	/**
	 * Returns a variable value as registered on the cloud by a given device.
	 */
	const cloudDeviceVar = (request, reply) => {
		let deviceId = request.payload.deviceId,
			varname = request.payload.varname;
		let authToken = request.auth.credentials.authtoken;
		let particle = request.app.particle.api;
		particle.getVariable({
			deviceId : deviceId,
			name : varname,
			auth : authToken
		}).then(
			(data) => {
				request.server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'Device variable retrieved successfully:', data);
				return reply(data);
			}, (err) => {
				request.server.log([ 'error', 'ParticleDevicesController#deviceList' ], 'An error occurred while getting attrs:', err);
				return reply(boom.badImplementation(err));
			});
	}

	/**
	 * Signal a device connected to the cloud.
	 */
	const signalDevice = (request, reply) => {
		let deviceId = request.payload.deviceId,
			signalOn = request.payload.signal;
		let authToken = request.auth.credentials.authtoken;
		let particle = request.app.particle.api;
		particle.signalDevice({
			deviceId : deviceId,
			signal : signalOn,
			auth : authToken
		}).then(
			(data) => {
				request.server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'Device is' + (signalOn ? '' : ' not') + ' shouting rainbows:', data);
				return reply(data);
			}, (err) => {
				request.server.log([ 'error', 'ParticleDevicesController#deviceList' ], 'Error sending a signal to the device:', err);
				return reply(boom.badImplementation(err));
			});
	}

	// expose public methods
	return {
		listDevices : cloudDeviceList,
		deviceFn : cloudDeviceFunction,
		sendSignal : signalDevice,
		deviceAttrs : cloudDeviceAttrs,
		deviceVar : cloudDeviceVar
	};

}
;

module.exports = ParticleDevicesController();