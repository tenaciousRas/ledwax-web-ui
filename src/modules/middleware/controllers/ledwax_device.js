#!/usr/bin/env node
'use strict';

const Boom = require('boom');
const Particle = require('particle-api-js');
const util = require('../../../util');

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
	let dynamicControllerFunctions = {};
	for (let funcName in particleDeviceVariableNames) {
		dynamicControllerFunctions['get' + util.capitalizeFirstLetter(funcName)] = () => {
	    let authToken = request.payload.auth;
	    let deviceId = request.payload.deviceId;
	    let varname = particleDeviceVariableNames[funcName];
			let fnProm = particle.getVariable({
					deviceId: deviceId,
					name: varname,
					auth: authToken
				});
			fnProm.then(function(data) {
			  server.log(['info', 'LedwaxDeviceController#' + funcName], 'Device variable retrieved successfully:', data);
	    	return reply(data);
			}, function(err) {
			  server.log(['info', 'LedwaxDeviceController#' + funcName], 'An error occurred while getting attrs:', err);
	    	return reply(err);
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
