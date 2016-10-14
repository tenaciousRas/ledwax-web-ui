'use strict';

const Particle = require('particle-api-js');

/**
 * Auth controller
 */
function ParticleDevicesController() {

	return {
		listDevices : cloudDeviceList,
		fn : cloudDeviceFunction,
		sendSignal : signalDevice,
		attrs : cloudDeviceAttrs,
		varval : cloudDeviceVar
	};

	/**
	 * Returns a list of devices registered with the particle cloud.
	 */
	function cloudDeviceList(request, reply) {
		var token = request.payload.token;
		var devicesPr = particle.listDevices({ auth: token });

		devicesPr.then(
		  function(devices){
		    console.log('Devices: ', devices);
	    	return reply(data);
		  },
		  function(err) {
		    console.log('List particle cloud devices call failed: ', err);
	    	return reply(err);
		  }
		);
	}

	/**
	 * Calls a function on a device connected to the cloud.
	 */
	function cloudDeviceFunction(request, reply) {
		var deviceId = request.payload.deviceId,
			fn = request.payload.fn,
			token = request.payload.token,
			arg = request.payload.arg;
		var fnPr = particle.callFunction({ deviceId: deviceId, name: fn, argument: arg, auth: token });
		fnPr.then(
		  function(data) {
		    console.log('Function called succesfully:', data);
	    	return reply(data);
		  }, function(err) {
		    console.log('An error occurred:', err);
	    	return reply(err);
		  }
		);
	}

	/**
	 * Returns a list of attributes for a given device.
	 */
	function cloudDeviceAttrs(request, reply) {
		var deviceId = request.payload.deviceId,
			token = request.payload.token;
		var devicesPr = particle.getDevice({ deviceId: deviceId, auth: token });
		devicesPr.then(
		  function(data){
		    console.log('Device attrs retrieved successfully:', data);
	    	return reply(data);
		  },
		  function(err) {
		    console.log('API call failed: ', err);
	    	return reply(err);
		  }
		);
	}

	/**
	 * Returns a variable value as registered on the cloud by a given device.
	 */
	function cloudDeviceVar(request, reply) {
		var deviceId = request.payload.deviceId,
			varname = request.payload.varname,
			token = request.payload.token;
		particle.getVariable({ deviceId: deviceId, name: varname, auth: token }).then(function(data) {
		  console.log('Device variable retrieved successfully:', data);
    	return reply(data);
		}, function(err) {
		  console.log('An error occurred while getting attrs:', err);
    	return reply(err);
		});
	}

	/**
	 * Signal a device connected to the cloud.
	 */
	function signalDevice(request, reply) {
		var deviceId = request.payload.deviceId,
			signalOn = request.payload.signal,
			token = request.payload.token;
		particle.signalDevice({ deviceId: deviceId, signal: signalOn, auth: token }).then(function(data) {
		  console.log('Device is' + (signalOn ? '' : ' not') + ' shouting rainbows:', data);
    	return reply(data);
		}, function(err) {
		  console.log('Error sending a signal to the device:', err);
    	return reply(err);
		});
	}

};

module.exports = ParticleDevicesController();