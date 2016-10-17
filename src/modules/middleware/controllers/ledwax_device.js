#!/usr/bin/env node
'use strict';

const boom = require('boom');
const util = require('../../../util');
const particlewrap = require('particle-api-js');

const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';
const particle_config = require('../../../particle-config').attributes[rt_ctx_env];
let particle = new particlewrap(particle_config);

// map particle variable to handler method names
const particleDeviceVariableNames = {
	numStrips: "getNumStrips",
	stripIndex: "getStripIndex",
	stripType: "getStripType",
	dispMode: "getDispMode",
	modeColor: "getModeColor",
	modeColorIdx: "getModeColorIdx",
	brightness: "getBrightness",
	fadeMode: "getFadeMode",
	fadeTime: "getFadeTime",
	colorTime: "getColorTime"
};
// map particle functions to handler method names
const particleDeviceFunctionNames = {
	setLEDParams: "fnSetLEDParams",
	resetAll: "fnResetAll"
};

/**
 * LedwaxDevice controller
 */
const LedwaxDeviceController = () => {
	// create handler functions with name of get[variable-name]
	// where variable-name in particleDeviceVariableNames
	let dynamicControllerFunctions = {};
	for (let varName in particleDeviceVariableNames) {
		dynamicControllerFunctions[particleDeviceVariableNames[varName]] = (request, reply) => {
			// particle variables are GET routes
	    let authToken = request.query.authtoken;
	    let deviceId = request.query.deviceId;
			let fnProm = particle.getVariable({
					deviceId: deviceId,
					name: varName,
					auth: authToken
				});
			if (!fnProm) {
				return reply(boom.expectationFailed('unable to get particle variable - unknown error'));
			}
			fnProm.then(
				(data) => {
				  request.server.log(['info', 'LedwaxDeviceController#' + varName], 'Device variable retrieved successfully:', data);
		    	return reply(data);
				}, (err) => {
				  request.server.log(['info', 'LedwaxDeviceController#' + varName], 'An error occurred while getting var:', err);
					return reply(boom.expectationFailed(err));
				});
		};
	}
	// create handler functions with name of get[function-name]
	// where function-name in particleDeviceFunctionNames
	for (let funcName in particleDeviceFunctionNames) {
		dynamicControllerFunctions[particleDeviceFunctionNames[funcName]] = (request, reply) => {
			// particle variables are GET routes
	    let authToken = request.payload.authtoken;
	    let deviceId = request.payload.deviceId;
	    let arg = request.payload.arg;
	    let iotFn = funcName;
			let fnProm = particle.callFunction({ deviceId: deviceId, name: iotFn, argument: arg, auth: authToken });
			if (!fnProm) {
				return reply(boom.expectationFailed('unable to call particle function - unknown error'));
			}
			fnProm.then(
				(data) => {
				  request.server.log(['info', 'LedwaxDeviceController#' + funcName], 'Device function retrieved successfully:', data);
		    	return reply(data);
				}, (err) => {
				  request.server.log(['info', 'LedwaxDeviceController#' + funcName], 'An error occurred while getting function:', err);
					return reply(boom.expectationFailed(err));
				});
		};
	}
	// expose public methods
	return dynamicControllerFunctions;
};

module.exports.controller = LedwaxDeviceController();
let dynamicFuncNames = { iotVars: [], iotFns: [] };
for (let varName in particleDeviceVariableNames) {
	dynamicFuncNames.iotVars.push({ iotVarName: varName, handlerFuncName: particleDeviceVariableNames[varName] });
}
for (let funcName in particleDeviceFunctionNames) {
	dynamicFuncNames.iotFns.push({ iotFnName: funcName, handlerFuncName: particleDeviceFunctionNames[funcName] });
}
module.exports.dynamicFuncNames = dynamicFuncNames;
