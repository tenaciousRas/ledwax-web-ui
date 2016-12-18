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
	const deviceList = (request, reply) => {
		let token = request.payload.token;
		let particle = request.app.particle.api;
		let devicesPr = particle.listDevices({
			auth : token
		});

		devicesPr.then(
			(devices) => {
				server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'Devices: ', devices);
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
			token = request.payload.token,
			arg = request.payload.arg;
		let particle = request.app.particle.api;
		let fnPr = particle.callFunction({
			deviceId : deviceId,
			name : fn,
			argument : arg,
			auth : token
		});
		fnPr.then(
			(data) => {
				server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'Function called succesfully:', data);
				return reply(data);
			}, (err) => {
				server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'An error occurred:', err);
				return reply(err);
			}
		);
	}

	/**
	 * Returns a list of attributes for a given device.
	 */
	const cloudDeviceAttrs = (request, reply) => {
		let deviceId = request.payload.deviceId,
			token = request.payload.token;
		let particle = request.app.particle.api;
		let devicesPr = particle.getDevice({
			deviceId : deviceId,
			auth : token
		});
		devicesPr.then(
			(data) => {
				server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'Device attrs retrieved successfully:', data);
				return reply(data);
			},
			(err) => {
				server.log([ 'error', 'ParticleDevicesController#deviceList' ], 'API call failed: ', err);
				return reply(boom.badImplementation(err));
			}
		);
	}

	/**
	 * Returns a variable value as registered on the cloud by a given device.
	 */
	const cloudDeviceVar = (request, reply) => {
		let deviceId = request.payload.deviceId,
			varname = request.payload.varname,
			token = request.payload.token;
		let particle = request.app.particle.api;
		particle.getVariable({
			deviceId : deviceId,
			name : varname,
			auth : token
		}).then(
			(data) => {
				server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'Device variable retrieved successfully:', data);
				return reply(data);
			}, (err) => {
				server.log([ 'error', 'ParticleDevicesController#deviceList' ], 'An error occurred while getting attrs:', err);
				return reply(boom.badImplementation(err));
			});
	}

	/**
	 * Signal a device connected to the cloud.
	 */
	const signalDevice = (request, reply) => {
		let deviceId = request.payload.deviceId,
			signalOn = request.payload.signal,
			token = request.payload.token;
		let particle = request.app.particle.api;
		particle.signalDevice({
			deviceId : deviceId,
			signal : signalOn,
			auth : token
		}).then(
			(data) => {
				server.log([ 'info', 'ParticleDevicesController#deviceList' ], 'Device is' + (signalOn ? '' : ' not') + ' shouting rainbows:', data);
				return reply(data);
			}, (err) => {
				server.log([ 'error', 'ParticleDevicesController#deviceList' ], 'Error sending a signal to the device:', err);
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