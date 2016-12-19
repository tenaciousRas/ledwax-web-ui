#!/usr/bin/env node
'use strict';
const Q = require('q');
const async = require('async');

module.exports = {
	/**
	 * Capitalize first letter of a string.
	 */
	capitalizeFirstLetter : (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	/**
	 * Return a function that calls {@link request.server#log(...)}.
	 */
	logDelegateFactory : (request) => {
		return (level, logName, msg) => {
			request.server.log([ level, logName ], msg + '\n');
		}
	},
	/**
	 * Extract IP and port from URL string.
	 */
	extractIPPortFromURL : (url) => {
		let ret = {};
		let urlParts = url.split("http://");
		urlParts = typeof urlParts[1] == 'undefined' ? null : urlParts[1].split("/");
		urlParts = typeof urlParts[0] == 'undefined' ? null : urlParts[0].split(":");
		ret.ip = (typeof urlParts[0] == 'undefined' ? '' : urlParts[0]);
		ret.port = (typeof urlParts[1] == 'undefined' ? '' : urlParts[1]);
		return ret;
	},

	/**
	 * Generic function calls for exposed particle functions.
	 */
	genericParticleFunctionCall : (particle, authToken, deviceId, log, iotFn, arg) => {
		const logTag = 'Util#genericParticleFunctionCall#iotFn';
		let fnProm = particle.callFunction({
			deviceId : deviceId,
			name : iotFn,
			argument : arg,
			auth : authToken
		});
		if (!fnProm) {
			deferred.reject('unable to call particle function - unknown error');
		}
		fnProm.then(
			(data) => {
				log([ 'info', logTag ], 'Device function invoked successfully:', data);
			}, (err) => {
				log([ 'info', logTag ], 'An error occurred while invoking function:', err);
			});
		return fnProm;
	},

	/**
	 * Get all particle device functions (handles) and variables, with variable values.
	 * Makes multiple REST calls.
	 * @return device capabilities JSON object
	 */
	getParticleDeviceCapabilities : (particle, authToken, deviceId, log) => {
		const logTag = 'Util#getParticleDeviceCapabilities';
		let deferred = Q.defer();
		let prom = particle.getDevice({
			deviceId : deviceId,
			auth : authToken
		});
		if (!prom) {
			deferred.reject('unable to query cloud for device attributes - unknown error - '
				+ 'are you sure the cloud is up and running?');
		}
		prom.then(
			(resp) => {
				let attrs = resp.body;
				//				log([ 'debug', logTag ],
				//					'Device attributes retrieved successfully: ' + JSON.stringify(attrs));
				if (!attrs.name || !attrs.name.startsWith('ledwax')) {
					let err = 'oops - somehow this doesn\'t appear to be a LEDWax device. The device ID is ' + attrs.id;
					log([ 'error', logTag ], err);
					deferred.reject(err);
				}
				if (!attrs.variables && !attrs.functions.length < 1) {
					let err = 'oops - a LEDWax device was discovered with no capabilities. The device ID is ' + attrs.id;
					log([ 'error', logTag ], err);
					deferred.reject(err);
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
						//						log([ 'info', logTag ], 'retrieving device variable ' + key + ' from cloud for device:', attrs.id);
						let fnProm = particle.getVariable({
							deviceId : attrs.id,
							name : key,
							auth : authToken
						});
						if (!fnProm) {
							let errMsg = 'unable to retrieve device variable ' + key + ' from cloud for device:' + attrs.id;
							//							log([ 'warn', logTag ], errMsg);
							return callback(new Error(errMsg));
						}
						fnProm.then((data) => {
							caps.vrs.push({
								varname : key,
								value : data.body.result,
								type : data.body.name
							});
							callback();
						}, (err) => {
							// no error so keep looping
							return callback(err);
						});
					} catch (e) {
						return callback(e);
					}
				}, (err) => {
					if (err) {
						log([ 'error', logTag ], 'An error occurred while getting device capabilities for device:' + deviceId + ', error was: ', err);
						if (caps.vrs.length < 1 && caps.fns.length < 1) {
							deferred.reject(err);
						}
					}
					deferred.resolve(caps);
				});
			}, (err) => {
				//				log([ 'error', logTag ], 'An error occurred while getting device description:', err);
				deferred.reject(err);
			});
		return deferred.promise;
	}
}