#!/usr/bin/env node
'use strict';

const boom = require('boom');
const async = require('async');
const Q = require('q');
const _ = require('lodash');
const util = require('../../../util');

/**
 * Auth controller
 */
const LedwaxCloudDeviceController = () => {

	/**
	 * Returns a list of devices in persistent storage for given cloud id.
	 * @param request.query.particleCloudId | request.payload.particleCloudId required the particleCloudId to query.
	 */
	const retrieveAllStoredDevices = (request, reply) => {
		let particleCloudId = request.payload ? request.payload.particleCloudId : request.query.particleCloudId;
		let db = request.getDb('apidb');
		let ledwaxDevice = db.getModel('ledwax_device');
		let ledStrip = db.getModel('ledwax_device_ledstrip');
		try {
			ledwaxDevice.findAll({
				where : {
					particleCloudId : particleCloudId
				},
				include : [ {
					model : ledStrip
				} ]
			}).then((devices) => {
				request.server.log([ 'debug', 'LedwaxCloudDeviceController#retrieveAllStoredDevices' ],
					'DB call complete - promise success, devices =:' + JSON.stringify(devices));
				let ret = [];
				if (null == devices) {
					return reply(ret);
				}
				for (let i = 0; i < devices.length; i++) {
					let device = JSON.parse(JSON.stringify(devices[i]));
					device.devTypeFW = 'LEDWax Device';
					ret.push(device);
				}
				return reply(ret);
			});
		} catch (e) {
			return reply(boom.badImplementation('exception while executing find all devices: ', e));
		}
	};

	/**
	 * Find a device in persistent storage.
	 * @param request.query.particleCloudId | request.payload.particleCloudId required the particleCloudId to query.
	 * @param request.query.DeviceId | request.payload.DeviceId required the deviceId to query.
	 */
	const retrieveStoredDevice = (request, reply) => {
		let particleCloudId = request.payload ? request.payload.particleCloudId : request.query.particleCloudId;
		let deviceId = request.payload ? request.payload.deviceId : request.query.deviceId;
		let db = request.getDb('apidb');
		let ledwaxDevice = db.getModel('ledwax_device');
		try {
			ledwaxDevice.findOne({
				where : {
					deviceId : new String(deviceId),
					particleCloudId : particleCloudId
				}
			}).then((device) => {
				request.server.log([ 'debug', 'LedwaxCloudDeviceController#retrieveStoredDevice' ],
					'DB call complete - promise success, devices =:' + device);
				if (null == device) {
					return reply({});
				}
				device = JSON.parse(JSON.stringify(device));
				device.devTypeFW = 'LEDWax Device';
				return reply(device);
			});
		} catch (e) {
			return reply(boom.badImplementation('exception while executing find device: ', e));
		}
	};

	/**
	 * Save a device to persistent storage.
	 * @param request.payload.numStrips required the number of connected LED strips.
	 * @param request.payload.particleCloudId required the particle cloud ID to save.
	 * @param request.payload.deviceId required the deviceId to save.
	 */
	const saveDevice = (request, reply) => {
		let db = request.getDb('apidb');
		let ledwaxDevice = db.getModel('ledwax_device');
		let id = request.payload ? request.payload.id : request.query.id;
		let particleCloudId = request.payload ? request.payload.particleCloudId : request.query.particleCloudId;
		let deviceId = request.payload ? request.payload.deviceId : request.query.deviceId;
		let numStrips = request.payload ? request.payload.numStrips : request.query.numStrips;
		let deviceNameFW = request.payload ? request.payload.deviceNameFW : request.query.deviceNameFW;
		let vals = {
			id : id,
			particleCloudId : particleCloudId,
			deviceId : deviceId,
			numStrips : numStrips,
			deviceNameFW : deviceNameFW
		};
		// setup to save variable number of fields but all are required here
		let saveFields = [];
		for (let key in vals) {
			if (typeof vals[key] == 'undefined' || vals[key] === null) {
				delete vals[key];
			} else {
				saveFields.push(key);
			}
		}
		try {
			ledwaxDevice.findOne({
				where : {
					deviceId : {
						$eq : new String(deviceId)
					},
					particleCloudId : {
						$eq : particleCloudId
					}
				}
			}).then((storedDevice) => {
				if (storedDevice == null || typeof storedDevice.id == 'undefined' || !storedDevice.id) {
					ledwaxDevice.build(vals).save().then((savedDevice) => {
						savedDevice = JSON.parse(JSON.stringify(savedDevice));
						savedDevice.devTypeFW = 'LEDWax Device';
						return reply(savedDevice);
					});
				} else {
					ledwaxDevice.update(vals, {
						logging : true,
						fields : saveFields,
						where : {
							id : storedDevice.id
						}
					}).then((updatedDevice) => {
						storedDevice = JSON.parse(JSON.stringify(storedDevice));
						storedDevice = _.merge({}, storedDevice, vals);
						storedDevice.devTypeFW = 'LEDWax Device';
						return reply(storedDevice);
					});
				}
			});
		} catch (e) {
			request.server.log([ 'error', 'ledwax cloud devices.contoller#save' ],
				'DB call complete - save device error, exception =:' + e);
			return reply(boom.badImplementation('unable to create device', e));
		}
	};

	/**
	 * Delete a device from persistent storage.
	 * @param request.payload.particleCloudId required the particle cloud ID to save.
	 * @param request.payload.deviceId required the deviceId to save.
	 * @return number of deleted rows
	 */
	const deleteDevice = (request, reply) => {
		let db = request.getDb('apidb');
		let ledwaxDevice = db.getModel('ledwax_device');
		let ledStrip = db.getModel('ledwax_device_ledstrip');
		let particleCloudId = request.payload ? request.payload.particleCloudId : request.query.particleCloudId;
		let deviceId = request.payload ? request.payload.deviceId : request.query.deviceId;
		ledStrip.destroy({
			where : {
				deviceId : {
					$eq : deviceId
				}
			},
			truncate : false //ignore where and truncate the table instead
		}).then((affectedRows) => {
			ledwaxDevice.destroy({
				where : {
					deviceId : {
						$eq : deviceId
					}
				},
				truncate : false //ignore where and truncate the table instead
			}).then((affectedRows) => {
				return reply({
					affectedRows : affectedRows
				});
			});
		});
	}

	/**
	 * Save a device to persistent storage.  Then call the paricle API to get all
	 * LEDStrip data.
	 * @param request.payload.particleCloudId required the particle cloud ID to save.
	 * @param request.payload.deviceId required the deviceId to save.
	 */
	const saveDeviceANDSaveLEDStrips = (request, reply) => {
		let db = request.getDb('apidb');
		let ledwaxDevice = db.getModel('ledwax_device');
		let ledStrip = db.getModel('ledwax_device_ledstrip');
		let particle = request.app.particle.api;
		let id = request.payload ? request.payload.id : request.query.id;
		let particleCloudId = request.payload ? request.payload.particleCloudId : request.query.particleCloudId;
		let deviceId = request.payload ? request.payload.deviceId : request.query.deviceId;
		let numStrips = request.payload ? request.payload.numStrips : request.query.numStrips;
		let deviceNameFW = request.payload ? request.payload.deviceNameFW : request.query.deviceNameFW;
		let authToken = request.payload ? request.payload.authtoken : request.query.authtoken;
		let vals = {
			id : id,
			particleCloudId : particleCloudId,
			deviceId : deviceId,
			numStrips : numStrips,
			deviceNameFW : deviceNameFW
		};
		// setup to save variable number of fields but all are required here
		let saveFields = [];
		for (let key in vals) {
			if (typeof vals[key] == 'undefined' || vals[key] === null) {
				delete vals[key];
			} else {
				saveFields.push(key);
			}
		}
		try {
			ledwaxDevice.findOne({
				where : {
					deviceId : {
						$eq : new String(deviceId)
					},
					particleCloudId : {
						$eq : particleCloudId
					}
				}
			}).then((storedDevice) => {
				if (storedDevice == null || typeof storedDevice.id == 'undefined' || !storedDevice.id) {
					ledwaxDevice.build(vals).save().then((savedDevice) => {
						// logger delegate to pass to util so it can be tested without request
						let logger = util.logDelegateFactory(request);
						let prom = saveDeviceLEDStripsFromDeviceParams(particle, db, authToken, savedDevice, logger);
						prom.then((data) => {
							return reply(data);
						}, (err) => {
							return reply(boom.badImplementation('device saved, but unable to save LED strips\n', err));
						});
					});
				} else {
					ledwaxDevice.update(vals, {
						logging : true,
						fields : saveFields,
						where : {
							id : storedDevice.id
						}
					}).then((updatedDevice) => {
						return reply(storedDevice);
					});
				}
			});
		} catch (e) {
			request.server.log([ 'error', 'ledwax cloud devices.contoller#save' ],
				'DB call complete - save device error, exception =:' + e);
			return reply(boom.badImplementation('unable to create device', e));
		}
	};

	/**
	 * Call the paricle API to get all LEDStrip data.  Then store the LEDStrip data in persisten storage.
	 * 
	 * @param request.payload.particleCloudId required the particle cloud ID to save.
	 * @param request.payload.deviceId required the deviceId to save.
	 * @return a promise that resolves/rejects when all ledstrips have been stored or an error occurs.
	 */
	const saveDeviceLEDStripsFromDeviceParams = (particle, db, authToken, savedDevice, logger) => {
		let deferred = Q.defer();
		let ledwaxDevice = db.getModel('ledwax_device');
		let ledStrip = db.getModel('ledwax_device_ledstrip');
		let iotFn = 'setLEDParams';
		let asyncFunctions = [];
		let retJSON = {
			id : savedDevice.id,
			particleCloudId : savedDevice.particleCloudId,
			deviceId : savedDevice.deviceId,
			numStrips : savedDevice.numStrips,
			devTypeFW : 'LEDWax Device',
			deviceNameFW : savedDevice.deviceNameFW,
			updatedAt : savedDevice.updatedAt,
			createdAt : savedDevice.createdAt,
			ledwax_device_ledstrips : []
		};
		for (let i = 0; i < savedDevice.numStrips; i++) {
			asyncFunctions.push((callback) => {
				let arg = 'idx;' + i;
				let prom = util.genericParticleFunctionCall(particle, authToken, savedDevice.deviceId, iotFn, arg, logger);
				prom.then((data) => {
					// get device capabilities
					let prom = util.getParticleDeviceCapabilities(particle, authToken, savedDevice.deviceId, logger);
					prom.then((deviceCaps) => {
						let vals = {
							ledwaxDeviceId : savedDevice.id,
							deviceId : deviceCaps.dvcId,
							stripIndex : i
						};
						for (let i = 0; i < deviceCaps.vrs.length; i++) {
							if (deviceCaps.vrs[i].varname == 'numStrips') {
								continue;
							}
							if (deviceCaps.vrs[i].varname == 'modeColor') {
								// sanitize json
								let val = deviceCaps.vrs[i].value;
								let sanitizedColors = [];
								let invalidColors = val.substring(1).substring(0, val.length - 2);
								invalidColors = invalidColors.split(',').forEach((item) => {
									sanitizedColors.push('#' + item + '');
								});
								deviceCaps.vrs[i].value = JSON.stringify(sanitizedColors);
							}
							vals[deviceCaps.vrs[i].varname] = deviceCaps.vrs[i].value;
						}
						logger('info', 'LedwaxCloudDeviceController#saveDeviceLEDStripsFromDeviceParams',
							'particle call complete - save led strip =:' + JSON.stringify(vals));
						ledStrip.build(vals).save().then((savedLEDStrip) => {
							retJSON.ledwax_device_ledstrips.push({
								id : savedLEDStrip.id,
								ledwaxDeviceId : savedLEDStrip.ledwaxDeviceId,
								deviceId : savedLEDStrip.deviceId,
								stripIndex : savedLEDStrip.stripIndex,
								stripType : savedLEDStrip.stripType,
								numPixels : savedLEDStrip.numPixels,
								numPixColors : savedLEDStrip.numPixColors,
								dispMode : savedLEDStrip.dispMode,
								modeColor : savedLEDStrip.modeColor,
								modeColorIdx : savedLEDStrip.modeColorIdx,
								brightness : savedLEDStrip.brightness,
								fadeMode : savedLEDStrip.fadeMode,
								fadeTime : savedLEDStrip.fadeTime,
								colorTime : savedLEDStrip.colorTime,
								updatedAt : savedLEDStrip.updatedAt,
								createdAt : savedLEDStrip.createdAt
							});
							callback();
						});
					}, (err) => {
						return callback(err);
					});
				}, (err) => {
					return callback(err);
				});
			});
		}
		async.series(asyncFunctions, (err) => {
			if (err) {
				deferred.reject('device saved, but unable to save LED strips, error =:' + err);
			} else {
				deferred.resolve(retJSON);
			}
		});
		return deferred.promise;
	};

	/**
	 * Save a device LED strip to persistent storage.
	 * @param request.payload.stripIndex required the strip index to save.
	 * @param request.payload.DeviceId required the deviceId to save.
	 */
	const saveDeviceLEDStrip = (request, reply) => {
		let db = request.getDb('apidb');
		let ledStrip = db.getModel('ledwax_device_ledstrip');
		let id = request.payload ? request.payload.id : request.query.id;
		let deviceId = request.payload ? request.payload.deviceId : request.query.deviceId;
		let stripIndex = request.payload ? request.payload.stripIndex : request.query.stripIndex;
		let stripType = request.payload ? request.payload.stripType : request.query.stripType;
		let numPixels = request.payload ? request.payload.numPixels : request.query.numPixels;
		let numPixColors = request.payload ? request.payload.numPixColors : request.query.numPixColors;
		let dispMode = request.payload ? request.payload.dispMode : request.query.dispMode;
		let color24Bit = request.payload ? request.payload.color24Bit : request.query.color24Bit;
		let modeColorIndex = request.payload ? request.payload.modeColorIndex : request.query.modeColorIndex;
		let brightness = request.payload ? request.payload.brightness : request.query.brightness;
		let fadeMode = request.payload ? request.payload.fadeMode : request.query.fadeMode;
		let fadeTimeInterval = request.payload ? request.payload.fadeTimeInterval : request.query.fadeTimeInterval;
		let colorHoldTime = request.payload ? request.payload.colorHoldTime : request.query.colorHoldTime;
		let vals = {
			id : id,
			deviceId : deviceId,
			stripIndex : stripIndex,
			stripType : stripType,
			numPixels : numPixels,
			numPixColors : numPixColors,
			dispMode : dispMode,
			brightness : brightness,
			modeColor : color24Bit,
			modeColorIdx : modeColorIndex,
			colorTime : colorHoldTime,
			fadeMode : fadeMode,
			fadeTime : fadeTimeInterval
		};
		let saveFields = [];
		for (let key in vals) {
			if (typeof vals[key] == 'undefined' || vals[key] === null) {
				delete vals[key];
			} else {
				saveFields.push(key);
			}
		}
		try {
			ledStrip.findOne({
				where : {
					deviceId : {
						$eq : new String(deviceId)
					},
					stripIndex : {
						$eq : stripIndex
					}
				}
			}).then((storedLEDStrip) => {
				if (storedLEDStrip == null || typeof storedLEDStrip.id == 'undefined' || !storedLEDStrip.id) {
					ledStrip.build(vals).save().then((savedLEDStrip) => {
						return reply(savedLEDStrip);
					});
				} else {
					ledStrip.update(vals, {
						logging : true,
						fields : saveFields,
						where : {
							deviceId : vals.deviceId,
							stripIndex : vals.stripIndex
						}
					}).then((updatedLEDStrip) => {
						return reply(updatedLEDStrip);
					});
				}
			});
		} catch (e) {
			request.server.log([ 'error', 'ledwax cloud devices.contoller#save' ],
				'DB call complete - save device error, exception =:' + e);
			return reply(boom.badImplementation('unable to create device', e));
		}
	};

	// expose public methods
	return {
		retrieveAllStoredDevices : retrieveAllStoredDevices,
		retrieveStoredDevice : retrieveStoredDevice,
		saveDevice : saveDevice,
		deleteDevice : deleteDevice,
		saveDeviceANDLEDStrips : saveDeviceANDSaveLEDStrips
	};

};

module.exports = LedwaxCloudDeviceController();