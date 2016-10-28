#!/usr/bin/env node
'use strict';

module.exports = {
	capitalizeFirstLetter : (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	logDelegateFactory : (request) => {
		return (level, logName, msg) => {
			request.server.log([ level, logName ], msg + '\n');
		}
	}
}