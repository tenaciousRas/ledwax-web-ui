#!/usr/bin/env node
'use strict';

const Joi = require('joi');
const boom = require('boom');

const failActDelegate = (msg) => {
  return (request, reply, source, error) => {
    error.output.payload.message = msg;
    return reply(boom.badData(error));
  };
};

module.exports.auth = {
	loginPost: {
		payload: {
			username: Joi.string().trim().min(3).max(100).required(),
			password: Joi.string().trim().min(2).max(35).required()
		},
    failAction: failActDelegate('custom')
	},
	loginGet: {
		query: {
			username: Joi.string().trim().min(3).max(100).required(),
			password: Joi.string().trim().min(2).max(35).required()
		},
    failAction: failActDelegate('custom')
	}
};

module.exports.user = {
	findCookie: {
		query: {
			cookietoken: Joi.string().trim().min(3).max(100).required()
		},
    failAction: failActDelegate('custom')
	},
	insert: {
		payload: {
			username: Joi.string().trim().min(3).max(100).required(),
			password: Joi.string().trim().min(2).max(35).required(),
			authtoken: Joi.string().trim().min(3).max(100).required(),
			cookietoken: Joi.string().trim().min(3).max(100).required()
		},
    failAction: failActDelegate('custom')
	},
	updateCookie: {
		payload: {
			username: Joi.string().trim().min(3).max(100),
			password: Joi.string().trim().min(2).max(35),
			authtoken: Joi.string().trim().min(3).max(100).required(),
			cookietoken: Joi.string().trim().min(3).max(100).required()
		},
    failAction: failActDelegate('custom')
	}
};

module.exports.ledwaxDevicesConvenience = {
	setCurrentStrip: {
		payload: {
			cookietoken: Joi.string().trim().min(3).max(100).required(),
			deviceId: Joi.string().trim().min(3).max(100).required(),
			stripIndex: Joi.number().integer().min(0).max(65535).required()
		},
    failAction: failActDelegate('custom')
	},
	setBrightness: {
		payload: {
			cookietoken: Joi.string().trim().min(3).max(100).required(),
			deviceId: Joi.string().trim().min(3).max(100).required(),
			brightness: Joi.number().integer().min(0).max(1024).required()
		},
    failAction: failActDelegate('custom')
	},
	setDispMode: {
		payload: {
			cookietoken: Joi.string().trim().min(3).max(100).required(),
			deviceId: Joi.string().trim().min(3).max(100).required(),
			dispMode: Joi.number().integer().min(0).max(35).required()
		},
    failAction: failActDelegate('custom')
	},
	setColor: {
		payload: {
			cookietoken: Joi.string().trim().min(3).max(100).required(),
			deviceId: Joi.string().trim().min(3).max(100).required(),
			modeColorIndex: Joi.number().integer().min(0).max(65535).required(),
			color24Bit: Joi.number().integer().min(0).max(16777215).required()
		},
    failAction: failActDelegate('custom')
	},
	setMultiColorHoldTime: {
		payload: {
			cookietoken: Joi.string().trim().min(3).max(100).required(),
			deviceId: Joi.string().trim().min(3).max(100).required(),
			holdTime: Joi.number().integer().min(0).max(65535).required()
		},
    failAction: failActDelegate('custom')
	},
	setLEDFadeMode: {
		payload: {
			cookietoken: Joi.string().trim().min(3).max(100).required(),
			deviceId: Joi.string().trim().min(3).max(100).required(),
			fadeMode: Joi.number().integer().min(0).max(2).required()
		},
    failAction: failActDelegate('custom')
	},
	setLEDFadeTimeInterval: {
		payload: {
			cookietoken: Joi.string().trim().min(3).max(100).required(),
			deviceId: Joi.string().trim().min(3).max(100).required(),
			fadeTimeInterval: Joi.number().integer().min(0).max(65535).required()
		},
    failAction: failActDelegate('custom')
	}
};

module.exports.ledwaxCloudDevices = {
	retrieveAllStoredDevices: {
		query: {
			cookietoken: Joi.string().trim().min(3).max(100).required(),
			particleCloudId: Joi.number().integer().required()
		},
    failAction: failActDelegate('custom')
	},
	retrieveStoredDevice: {
		query: {
			cookietoken: Joi.string().trim().min(3).max(100).required(),
			particleCloudId: Joi.number().integer().required(),
			deviceId: Joi.string().trim().min(3).max(100).required()
		},
    failAction: failActDelegate('custom')
	},
	saveDevice: {
		payload: {
			cookietoken: Joi.string().trim().min(3).max(100).required(),
			id: Joi.number().integer().optional(),
			particleCloudId: Joi.number().integer().required(),
			deviceId: Joi.string().trim().min(3).max(100).required(),
			numStrips: Joi.number().integer().min(0).max(65535).optional(),
			stripIndex: Joi.number().integer().min(0).max(65535).optional(),
			stripType: Joi.number().integer().min(0).max(1).optional(),
			brightness: Joi.number().integer().min(0).max(1024).optional(),
			dispMode: Joi.number().integer().min(0).max(35).optional(),
			modeColorIndex: Joi.number().integer().min(0).max(65535).optional(),
			color24Bit: Joi.number().integer().min(0).max(16777215).optional(),
			colorHoldTime: Joi.number().integer().min(0).max(65535).optional(),
			fadeMode: Joi.number().integer().min(0).max(2).optional(),
			fadeTimeInterval: Joi.number().integer().min(0).max(65535).optional()
		},
    failAction: failActDelegate('custom')
	}
}

// add routes for dynamically created iot vars and iot FNs
const buildDynamicValidationsForController = () => {
  let dynamic_ledwax_devices = {};
  // validate iot vars
  let dynFuncNames = require('../controllers/ledwax_device').dynamicFuncNames.iotVars;
  for (let i = 0; i < dynFuncNames.length; i++) {
  	let key = dynFuncNames[i].handlerFuncName;
    dynamic_ledwax_devices[key] = {
    		query: {
    			authtoken: Joi.string().trim().min(3).max(100).required(),
    			deviceId: Joi.string().trim().min(3).max(50).required()
    		},
        failAction: failActDelegate('custom')
      };
  }
  // validate iot FNs
  dynFuncNames = require('../controllers/ledwax_device').dynamicFuncNames.iotFns;
  for (let i = 0; i < dynFuncNames.length; i++) {
  	let key = dynFuncNames[i].handlerFuncName;
    dynamic_ledwax_devices[key] = {
    		payload: {
    			authtoken: Joi.string().trim().min(3).max(100).required(),
    			deviceId: Joi.string().trim().min(3).max(50).required(),
    			args: Joi.any().optional()
    		},
        failAction: failActDelegate('custom')
      };
  }
  module.exports.ledwaxDevices = dynamic_ledwax_devices;
};
buildDynamicValidationsForController();
