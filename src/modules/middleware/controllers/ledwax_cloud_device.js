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
	}

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
	}

	/**
	 * Save a device to persistent storage.
	 * @request.payload.particleCloudId required the particleCloudId to query.
	 * @request.payload.DeviceId required the deviceId to save.
	 */
	const saveDevice = (request, reply) => {
		let db = request.getDb('apidb');
		let ledwaxDevice = db.getModel('ledwax_device');
		let id = request.payload ? request.payload.id : request.query.id;
		let particleCloudId = request.payload ? request.payload.particleCloudId : request.query.particleCloudId;
		let deviceId = request.payload ? request.payload.deviceId : request.query.deviceId;
		let numStrips = request.payload ? request.payload.numStrips : request.query.numStrips;
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
			particleCloudId : particleCloudId,
			deviceId : deviceId,
			numStrips : numStrips,
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
			if (typeof vals.id == 'undefined' || !vals.id) {
				ledwaxDevice.build(vals).save().then((device) => {
					return reply(device);
				});
			} else {
				ledwaxDevice.update(vals, {logging : true, fields: saveFields, where: { id : vals.id }}).then((device) => {
					return reply(device);
				});
			}
		} catch (e) {
			request.server.log([ 'error', 'ledwax cloud devices.contoller#save' ],
				'DB call complete - save device error, exception =:' + e);
			return reply(boom.badImplementation('unable to create device', e));
		}
	}

	// expose public methods
	return {
		retrieveAllStoredDevices : retrieveAllStoredDevices,
		retrieveStoredDevice : retrieveStoredDevice,
		saveDevice : saveDevice
	};

};

module.exports = LedwaxCloudDeviceController();