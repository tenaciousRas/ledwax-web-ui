#!/usr/bin/env node
'use strict';

const config = {
	dev: {
		baseUrl: 'http://192.168.4.124',
		clientSecret: 'particle-api',
		clientId: 'particle-api',
		tokenDuration: 7776000 // 90 days
	},
	test: {
		baseUrl: 'http://vagrant-ubuntu-trusty-64:3001',
		clientSecret: 'particle-api',
		clientId: 'particle-api',
		tokenDuration: 7776000 // 90 days
	}
}

exports.attributes = config;
