#!/usr/bin/env node
'use strict';

const boom = require('boom');
const util = require('../../../util');
const particlewrap = require('particle-api-js');

const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';
const particle_config = require('../../../particle-config').attributes[rt_ctx_env];
let particle = new particlewrap(particle_config);

/**
 * LedwaxDevice controller
 */
const LedwaxDeviceController = () => {
	const particleDeviceVariableNames = {
		numStrips: "numStrips",
		stripIndex: "stripIndex",
		stripType: "stripType",
		dispMode: "dispMode",
		modeColor: "modeColor",
		modeColorIdx: "modeColorIdx",
		brightness: "brightness",
		fadeMode: "fadeMode",
		fadeTime: "fadeTime",
		colorTime: "colorTime"
	};
	// create handler functions with name of get[variable-name]
	// where variable-name in particleDeviceVariableNames
	let dynamicControllerFunctions = {};
	for (let funcName in particleDeviceVariableNames) {
		dynamicControllerFunctions['get' + util.capitalizeFirstLetter(funcName)] = (request, reply) => {
			// particle variables are GET routes
	    let authToken = request.query.authtoken;
	    let deviceId = request.query.deviceId;
	    let varname = particleDeviceVariableNames[funcName];
			let fnProm = particle.getVariable({
					deviceId: deviceId,
					name: varname,
					auth: authToken
				});
			if (!fnProm) {
				return reply(boom.expectationFailed(err));
			}
			fnProm.then(
				(data) => {
				  request.server.log(['info', 'LedwaxDeviceController#' + funcName], 'Device variable retrieved successfully:', data);
		    	return reply(data);
				}, (err) => {
				  request.server.log(['info', 'LedwaxDeviceController#' + funcName], 'An error occurred while getting attrs:', err);
					return reply(boom.expectationFailed(err));
				});
		};
	}
	// expose public methods
	return dynamicControllerFunctions;
};

module.exports.controller = LedwaxDeviceController();
let dynamicFuncNames = [];
for (let funcName in LedwaxDeviceController()) {
	dynamicFuncNames.push(funcName);
}
module.exports.dynamicFuncNames = dynamicFuncNames;
