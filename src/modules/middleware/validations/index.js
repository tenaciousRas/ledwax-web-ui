'use strict';

var Joi = require('joi');

module.exports = {
	login: {
		payload: {
			name: Joi.string().trim().min(3).max(100).required(),
			password: Joi.string().trim().min(2).max(35).required()
		}
	},
	update: {
		payload: {
			name: Joi.string().trim().min(3).max(100).required(),
			password: Joi.string().trim().min(2).max(35).required()
		}
	}
};
