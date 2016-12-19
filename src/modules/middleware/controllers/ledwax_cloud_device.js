#!/usr/bin/env node
'use strict';

const boom = require('boom');
const async = require('async');
const Q = require('q');
const util = require('../../../util');

/**
 * Auth controller
 */
const LedwaxCloudDeviceController = () => {

	/**
	 * Returns a list of devices in persistent storage for given cloud id.
	 * @request.query.particleCloudId | request.payload.particleCloudId required the particleCloudId to query.
	 */
	const retrieveAllStoredDevices = (request, reply) => {
		let particleCloudId = request.payload ? request.payload.particleCloudId : request.query.particleCloudId;
		let db = request.getDb('apidb');
		let ledwaxDevice = db.getModel('ledwax_device');
		try {
			ledwaxDevice.findAll({
				where : {
					particleCloudId : particleCloudId
				},
			}).then((devices) => {
				request.server.log([ 'debug', 'LedwaxCloudDeviceController#retrieveAllStoredDevices' ],
					'DB call complete - promise success, devices =:' + devices);
				if (null == devices) {
					return reply([]);
				}
				return reply(devices);
			});
		} catch (e) {
			return reply(boom.badImplementation('exception while executing find all devices: ', e));
		}
	};

	/**
	 * Find a device in persistent storage.
	 * @request.query.particleCloudId | request.payload.particleCloudId required the particleCloudId to query.
	 * @request.query.DeviceId | request.payload.DeviceId required the deviceId to query.
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
				},
			}).then((device) => {
				request.server.log([ 'debug', 'LedwaxCloudDeviceController#retrieveStoredDevice' ],
					'DB call complete - promise success, devices =:' + device);
				if (null == device) {
					return reply({});
				}
				return reply(device);
			});
		} catch (e) {
			return reply(boom.badImplementation('exception while executing find device: ', e));
		}
	};

	/**
	 * Save a device to persistent storage.
	 * @request.payload.numStrips required the number of connected LED strips.
	 * @request.payload.particleCloudId required the particle cloud ID to save.
	 * @request.payload.deviceId required the deviceId to save.
	 */
	const saveDevice = (request, reply) => {
		let db = request.getDb('apidb');
		let ledwaxDevice = db.getModel('ledwax_device');
		let id = request.payload ? request.payload.id : request.query.id;
		let particleCloudId = request.payload ? request.payload.particleCloudId : request.query.particleCloudId;
		let deviceId = request.payload ? request.payload.deviceId : request.query.deviceId;
		let numStrips = request.payload ? request.payload.numStrips : request.query.numStrips;
		let vals = {
			id : id,
			particleCloudId : particleCloudId,
			deviceId : deviceId,
			numStrips : numStrips
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
						return reply(updatedDevice);
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
	 * Save a device to persistent storage.  Then call the paricle API to get all
	 * LEDStrip data.
	 * @request.payload.particleCloudId required the particle cloud ID to save.
	 * @request.payload.deviceId required the deviceId to save.
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
		let authToken = request.payload ? request.payload.authtoken : request.query.authtoken;
		let vals = {
			id : id,
			particleCloudId : particleCloudId,
			deviceId : deviceId,
			numStrips : numStrips
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
						let retJSON = {
							id : savedDevice.id,
							particleCloudId : savedDevice.particleCloudId,
							deviceId : savedDevice.deviceId,
							numStrips : savedDevice.numStrips,
							updatedAt : savedDevice.updatedAt,
							createdAt : savedDevice.createdAt,
							ledStrips : []
						};
						let iotFn = 'setLEDParams';
						let asyncFunctions = [];
						for (let i = 0; i < numStrips; i++) {
							asyncFunctions.push((callback) => {
								let arg = 'idx;' + i;
								let prom = util.genericParticleFunctionCall(particle, authToken, vals.deviceId, request.server.log, iotFn, arg);
								prom.then((data) => {
									// get device capabilities
									let prom = util.getParticleDeviceCapabilities(particle, authToken, vals.deviceId, request.server.log);
									prom.then((deviceCaps) => {
										vals = {
											ledwaxDeviceId : savedDevice.id,
											deviceId : deviceCaps.dvcId,
											stripIndex : i
										};
										console.log('#####' + JSON.stringify(vals));
										for (let i = 0; i < deviceCaps.vrs.length; i++) {
											if (deviceCaps.vrs[i].varname == 'numStrips') {
												continue;
											}
											if (deviceCaps.vrs[i].varname == 'modeColor') {
												deviceCaps.vrs[i].value = parseInt(deviceCaps.vrs[i].value, 16);
											}
											vals[deviceCaps.vrs[i].varname] = deviceCaps.vrs[i].value;
										}
										request.server.log([ 'info', 'LedwaxCloudDeviceController#saveDevicesANDSaveLEDStrips' ],
											'particle call complete - save device =:' + deviceCaps);
										ledStrip.build(vals).save().then((savedLEDStrip) => {
											retJSON.ledStrips.push({
												id : savedLEDStrip.id,
												ledwaxDeviceId : savedLEDStrip.ledwaxDeviceId,
												deviceId : savedLEDStrip.deviceId,
												stripIndex : savedLEDStrip.stripIndex,
												stripType : savedLEDStrip.stripType,
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
								return reply(boom.badImplementation('device saved, but unable to save LED strips', err));
							}
							return reply(retJSON);
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
						return reply(updatedDevice);
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
	 * Save a device LED strip to persistent storage.
	 * @request.payload.stripIndex required the strip index to save.
	 * @request.payload.DeviceId required the deviceId to save.
	 */
	const saveDeviceLEDStrip = (request, reply) => {
		let db = request.getDb('apidb');
		let ledStrip = db.getModel('ledwax_device_ledstrip');
		let id = request.payload ? request.payload.id : request.query.id;
		let deviceId = request.payload ? request.payload.deviceId : request.query.deviceId;
		let stripIndex = request.payload ? request.payload.stripIndex : request.query.stripIndex;
		let stripType = request.payload ? request.payload.stripType : request.query.stripType;
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
			brightness : brightness,
			dispMode : dispMode,
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
		saveDeviceANDLEDStrips : saveDeviceANDSaveLEDStrips
	};

};

module.exports = LedwaxCloudDeviceController();