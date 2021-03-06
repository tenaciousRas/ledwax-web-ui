#!/usr/bin/env node
'use strict';

const boom = require('boom');
const _ = require('lodash');
const util = require('../../../util');

const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';
const ledwax_iot_config = require('../../../particle-config/iotdef_ledwax.json');
// map particle variable to handler method names
const particleDeviceVariableNames = ledwax_iot_config.particleDeviceVariableNames;
// map particle functions to handler method names
const particleDeviceFunctionNames = ledwax_iot_config.particleDeviceFunctionNames;

/**
 * LedwaxDevice controller
 */
const LedwaxDeviceController = () => {

	/**
	 * create handler functions with name of get[variable-name]
	 * where variable-name in particleDeviceVariableNames
	 */
	let dynamicControllerFunctions = {};
	for (let varName in particleDeviceVariableNames) {
		dynamicControllerFunctions[particleDeviceVariableNames[varName]] = (request, reply) => {
			// particle variables are GET routes
			let authToken = request.auth.credentials.authtoken;
			let deviceId = request.query.deviceId;
			let particle = request.app.particle.api;
			let fnProm = particle.getVariable({
				deviceId : deviceId,
				name : varName,
				auth : authToken
			});
			if (!fnProm) {
				return reply(boom.expectationFailed('unable to get particle variable - unknown error'));
			}
			fnProm.then(
				(data) => {
					request.server.log([ 'info', 'LedwaxDeviceController#' + varName ], 'Device variable retrieved successfully:', data);
					return reply(data);
				}, (err) => {
					request.server.log([ 'info', 'LedwaxDeviceController#' + varName ], 'An error occurred while getting var:', err);
					return reply(boom.expectationFailed(err));
				});
		};
	}

	/**
	 * create handler functions with name of get[function-name]
	 * where function-name in particleDeviceFunctionNames
	 */
	for (let funcName in particleDeviceFunctionNames) {
		dynamicControllerFunctions[particleDeviceFunctionNames[funcName]] = (request, reply) => {
			let particle = request.app.particle.api;
			// particle variables are GET routes
			let authToken = request.auth.credentials.authtoken;
			let deviceId = request.payload.deviceId;
			let arg = request.payload.arg;
			let iotFn = funcName;
			let fnProm = particle.callFunction({
				deviceId : deviceId,
				name : iotFn,
				argument : arg,
				auth : authToken
			});
			if (!fnProm) {
				return reply(boom.expectationFailed('unable to call particle function - unknown error'));
			}
			fnProm.then(
				(data) => {
					request.server.log([ 'info', 'LedwaxDeviceController#' + funcName ], 'Device function retrieved successfully:', data);
					return reply(data);
				}, (err) => {
					request.server.log([ 'info', 'LedwaxDeviceController#' + funcName ], 'An error occurred while getting function:', err);
					return reply(boom.expectationFailed(err));
				});
		};
	}

	/**
	 * Wrapper for util.genericParticleFunctionCall(particle, authToken, deviceId, log, iotFn, arg).
	 */
	const doGenericParticleFunctionCall = (request, iotFn, arg) => {
		let particle = request.app.particle.api;
		let authToken = request.auth.credentials.authtoken;
		let deviceId = request.payload.deviceId;
		let logger = util.logDelegateFactory(request);
		let prom = util.genericParticleFunctionCall(particle, authToken, deviceId, iotFn, arg, logger);
		return prom;
	};

	/**
	 * Set current LED strip being controlled.
	 */
	const setCurrentStrip = (request, reply) => {
		let stripIndex = request.payload.stripIndex;
		let iotFn = 'setLEDParams';
		// The format for "command" is:
		// > [command-name];[cmd-value]?[,cmd-value]*
		let arg = 'idx;' + stripIndex;
		let prom = doGenericParticleFunctionCall(request, iotFn, arg);
		prom.then((data) => {
			return reply(data);
		}, (err) => {
			return reply(boom.expectationFailed(err));
		});
	};

	/**
	 * Set LED strip brightness.
	 */
	const setBrightness = (request, reply) => {
		let stripIndex = request.payload.stripIndex;
		let brightness = request.payload.brightness;
		let iotFn = 'setLEDParams';
		// The format for "command" is:
		// [command-name];[cmd-value]?[,cmd-value]*
		let arg = 'idx;' + stripIndex;
		let prom = doGenericParticleFunctionCall(request, iotFn, arg);
		prom.then((data) => {
			let arg = 'brt;' + brightness;
			let prom = doGenericParticleFunctionCall(request, iotFn, arg);
			prom.then((data) => {
				return reply(data);
			}, (err) => {
				return reply(boom.expectationFailed(err));
			});
		}, (err) => {
			return reply(boom.expectationFailed(err));
		});
	};

	/**
	 * Set LED strip display mode.
	 */
	const setDispMode = (request, reply) => {
		let stripIndex = request.payload.stripIndex;
		let dispMode = request.payload.dispMode;
		let iotFn = 'setLEDParams';
		// The format for "command" is:
		// [command-name];[cmd-value]?[,cmd-value]*
		let arg = 'idx;' + stripIndex;
		let prom = doGenericParticleFunctionCall(request, iotFn, arg);
		prom.then((data) => {
			let arg = 'mod;' + dispMode;
			let prom = doGenericParticleFunctionCall(request, iotFn, arg);
			prom.then((data) => {
				return reply(data);
			}, (err) => {
				return reply(boom.expectationFailed(err));
			});
		}, (err) => {
			return reply(boom.expectationFailed(err));
		});
	};

	/**
	 * Set LED strip color.
	 */
	const setColor = (request, reply) => {
		let stripIndex = request.payload.stripIndex;
		let modeColorIndex = request.payload.modeColorIndex;
		let color24Bit = request.payload.color24Bit;
		let iotFn = 'setLEDParams';
		// The format for "command" is:
		// [command-name];[cmd-value]?[,cmd-value]*
		let arg = 'idx;' + stripIndex;
		let prom = doGenericParticleFunctionCall(request, iotFn, arg);
		prom.then((data) => {
			// The format for "command" is:
			// > [command-name];[cmd-value]?[,cmd-value]*
			//	[mode-color-index],[24-bit-integer]
			//	where mode-color-index is the index of the mode color (family 1 display mode) to set
			//	valid color values are 0 - 16777215 (24-bit integer)
			let arg = 'col;' + modeColorIndex + ',' + color24Bit;
			let prom = doGenericParticleFunctionCall(request, iotFn, arg);
			prom.then((data) => {
				return reply(data);
			}, (err) => {
				return reply(boom.expectationFailed(err));
			});
		}, (err) => {
			return reply(boom.expectationFailed(err));
		});
	};

	/**
	 * Set LED strip multi color hold time = time to display each color in the display mode.
	 * See (firmware docs)[https://github.com/tenaciousRas/ledwax-photon-firmware].
	 */
	const setMultiColorHoldTime = (request, reply) => {
		let stripIndex = request.payload.stripIndex;
		let holdTime = request.payload.holdTime;
		let iotFn = 'setLEDParams';
		// The format for "command" is:
		// [command-name];[cmd-value]?[,cmd-value]*
		let arg = 'idx;' + stripIndex;
		let prom = doGenericParticleFunctionCall(request, iotFn, arg);
		prom.then((data) => {
			let arg = 'mht;' + holdTime;
			let prom = doGenericParticleFunctionCall(request, iotFn, arg);
			prom.then((data) => {
				return reply(data);
			}, (err) => {
				return reply(boom.expectationFailed(err));
			});
		}, (err) => {
			return reply(boom.expectationFailed(err));
		});
	};

	/**
	 * Set LED strip fade mode.  The led-fade-mode is the style of transition between colors, and only applies to certain display modes.
	 * See (firmware docs)[https://github.com/tenaciousRas/ledwax-photon-firmware].
	 */
	const setLEDFadeMode = (request, reply) => {
		let stripIndex = request.payload.stripIndex;
		let fadeMode = request.payload.fadeMode;
		let iotFn = 'setLEDParams';
		// The format for "command" is:
		// [command-name];[cmd-value]?[,cmd-value]*
		let arg = 'idx;' + stripIndex;
		let prom = doGenericParticleFunctionCall(request, iotFn, arg);
		prom.then((data) => {
			let arg = 'lfm;' + fadeMode;
			let prom = doGenericParticleFunctionCall(request, iotFn, arg);
			prom.then((data) => {
				return reply(data);
			}, (err) => {
				return reply(boom.expectationFailed(err));
			});
		}, (err) => {
			return reply(boom.expectationFailed(err));
		});
	};

	/**
	 * Set LED fade time interval.  The led-fade-mode-time-interval is the duration of the fade.
	 * The LED-fade-mode time-interval defines the duration of the LED color transition, in milliseconds.
	 */
	const setLEDFadeTimeInterval = (request, reply) => {
		let stripIndex = request.payload.stripIndex;
		let fadeTimeInterval = request.payload.fadeTimeInterval;
		let iotFn = 'setLEDParams';
		// The format for "command" is:
		// [command-name];[cmd-value]?[,cmd-value]*
		let arg = 'idx;' + stripIndex;
		let prom = doGenericParticleFunctionCall(request, iotFn, arg);
		prom.then((data) => {
			let arg = 'lfti;' + fadeTimeInterval;
			let prom = doGenericParticleFunctionCall(request, iotFn, arg);
			prom.then((data) => {
				return reply(data);
			}, (err) => {
				return reply(boom.expectationFailed(err));
			});
		}, (err) => {
			return reply(boom.expectationFailed(err));
		});
	};

	// expose public methods
	let staticFns = {
		setCurrentStrip : setCurrentStrip,
		setBrightness : setBrightness,
		setDispMode : setDispMode,
		setColor : setColor,
		setMultiColorHoldTime : setMultiColorHoldTime,
		setLEDFadeMode : setLEDFadeMode,
		setLEDFadeTimeInterval : setLEDFadeTimeInterval
	};
	return _.extend(dynamicControllerFunctions, staticFns);
};

module.exports.controller = LedwaxDeviceController();
let dynamicFuncNames = {
	iotVars : [],
	iotFns : []
};
for (let varName in particleDeviceVariableNames) {
	dynamicFuncNames.iotVars.push({
		iotVarName : varName,
		handlerFuncName : particleDeviceVariableNames[varName]
	});
}
for (let funcName in particleDeviceFunctionNames) {
	dynamicFuncNames.iotFns.push({
		iotFnName : funcName,
		handlerFuncName : particleDeviceFunctionNames[funcName]
	});
}
module.exports.dynamicFuncNames = dynamicFuncNames;