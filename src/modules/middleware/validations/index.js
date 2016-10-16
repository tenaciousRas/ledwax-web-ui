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

module.exports = {
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
	},
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
