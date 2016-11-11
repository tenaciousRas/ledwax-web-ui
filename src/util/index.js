#!/usr/bin/env node
'use strict';

module.exports = {
	/**
	 * Capitalize first letter of a string.
	 */
	capitalizeFirstLetter : (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	/**
	 * Return a function that calls {@link request.server#log(...)}.
	 */
	logDelegateFactory : (request) => {
		return (level, logName, msg) => {
			request.server.log([ level, logName ], msg + '\n');
		}
	},
	/**
	 * Extract IP and port from URL string.
	 */
	extractIPPortFromURL : (url) => {
		let ret = {};
		let urlParts = url.split("http://");
		urlParts = typeof urlParts[1] == 'undefined' ? null : urlParts[1].split("/");
		urlParts = typeof urlParts[0] == 'undefined' ? null : urlParts[0].split(":");
		ret.ip = (typeof urlParts[0] == 'undefined' ? '' : urlParts[0]);
		ret.port = (typeof urlParts[1] == 'undefined' ? '' : urlParts[1]);
		return ret;
	}
}