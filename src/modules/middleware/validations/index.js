#!/usr/bin/env node
'use strict';

const Joi = require('joi');
const boom = require('boom');

let failActDelegate = (msg) => {
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

let dynFuncNames = require('../controllers/ledwax_device').dynamicFuncNames;
let dynamic_ledwax_devices = {};
for (let i = 0; i < dynFuncNames.length; i++) {
	let key = dynFuncNames[i];
  dynamic_ledwax_devices[key] = {
  		query: {
  			authtoken: Joi.string().trim().min(3).max(100).required(),
  			deviceId: Joi.string().trim().min(3).max(50).required()
  		},
      failAction: failActDelegate('custom')
    };
}
module.exports.ledwaxDevices = dynamic_ledwax_devices;
