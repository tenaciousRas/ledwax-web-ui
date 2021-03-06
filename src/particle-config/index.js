#!/usr/bin/env node
'use strict';

const config = {
	dev : {
		name : 'dev-local',
		baseUrl : 'http://192.168.4.124',
		clientSecret : 'particle-api',
		clientId : 'particle-api',
		tokenDuration : 7776000 // 90 days
	},
	dev_debug : {
		name : 'dev-debug-local',
		baseUrl : 'http://192.168.4.124',
		clientSecret : 'particle-api',
		clientId : 'particle-api',
		tokenDuration : 7776000 // 90 days
	},
	test : {
		name : 'vagrant-test',
		baseUrl : 'http://127.0.0.1:3001',
		clientSecret : 'particle-api',
		clientId : 'particle-api',
		tokenDuration : 7776000 // 90 days
	},
	production : {
		name : 'prod-local',
		baseUrl : 'http://192.168.4.124',
		clientSecret : 'particle-api',
		clientId : 'particle-api',
		tokenDuration : 7776000 // 90 days
	}
}

exports.attributes = config;