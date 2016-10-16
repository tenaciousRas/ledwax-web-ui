#!/usr/bin/env node
'use strict';

const Joi = require('joi');
const boom = require('boom');

module.exports = {
	loginPost: {
		payload: {
			username: Joi.string().trim().min(3).max(100).required(),
			password: Joi.string().trim().min(2).max(35).required()
		},
    failAction: (request, reply, source, error) => {
        error.output.payload.message = 'custom';
        return reply(boom.badData(error));
    }
	},
	loginGet: {
		query: {
			username: Joi.string().trim().min(3).max(100).required(),
			password: Joi.string().trim().min(2).max(35).required()
		},
    failAction: (request, reply, source, error) => {
        error.output.payload.message = 'custom';
        return reply(boom.badData(error));
    }
	},
	findCookie: {
		query: {
			cookietoken: Joi.string().trim().min(3).max(100).required()
		},
    failAction: (request, reply, source, error) => {
        error.output.payload.message = 'custom';
        return reply(boom.badData(error));
    }
	},
	insert: {
		payload: {
			username: Joi.string().trim().min(3).max(100).required(),
			password: Joi.string().trim().min(2).max(35).required(),
			authtoken: Joi.string().trim().min(3).max(100).required(),
			cookietoken: Joi.string().trim().min(3).max(100).required()
		},
    failAction: (request, reply, source, error) => {
        error.output.payload.message = 'custom';
        return reply(boom.badData(error));
    }
	},
	updateCookie: {
		payload: {
			username: Joi.string().trim().min(3).max(100),
			password: Joi.string().trim().min(2).max(35),
			authtoken: Joi.string().trim().min(3).max(100).required(),
			cookietoken: Joi.string().trim().min(3).max(100).required()
		},
    failAction: (request, reply, source, error) => {
        error.output.payload.message = 'custom';
        return reply(boom.badData(error));
    }
	}
};
