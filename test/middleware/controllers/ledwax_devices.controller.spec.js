#!/usr/bin/env node
'use strict';

const assert = require('assert');
let pg = require('pg');
const boom = require('boom');

describe('api', () => {

	let server,
		db,
		particleConfig;

	beforeAll((done) => {
		server = require('../mockserver.js').createServer();
		particleConfig = server.methods.particle.config();
		// https://github.com/hapijs/hapi/issues/3017
		setTimeout(() => {
			done();
		}, 1500);
	});

	let dynFuncNames = require('../../../src/modules/middleware/controllers/ledwax_device').dynamicFuncNames;
	for (let i = 0; i < dynFuncNames.iotVars.length; i++) {
		let funcName = dynFuncNames.iotVars[i].handlerFuncName;
		let varName = dynFuncNames.iotVars[i].iotVarName;
		describe('ledwax_device controller ' + funcName, () => {

			it('empty params returns 422 NOT OK', (done) => {
				let options = {
					method : 'GET',
					url : '/devices/' + funcName
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(422);
						expect(JSON.parse(response.payload).message).toBe('Error: child "authtoken" fails because ["authtoken" is required]');
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

			it('missing params returns 422 NOT OK', (done) => {
				let options = {
					method : 'GET',
					url : '/devices/' + funcName + '?foo=bar'
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(422);
						expect(JSON.parse(response.payload).message).toBe('Error: child "authtoken" fails because ["authtoken" is required]');
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

			it('missing deviceId param returns 422 NOT OK', (done) => {
				let options = {
					method : 'GET',
					url : '/devices/' + funcName + '?authtoken=foobar'
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(422);
						expect(JSON.parse(response.payload).message).toBe('Error: child "deviceId" fails because ["deviceId" is required]');
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

			it('missing authtoken param returns 422 NOT OK', (done) => {
				let options = {
					method : 'GET',
					url : '/devices/' + funcName + '?deviceId=foobar'
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(422);
						expect(JSON.parse(response.payload).message).toBe('Error: child "authtoken" fails because ["authtoken" is required]');
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

			it('invalid authtoken returns 417 Bad Expectation', (done) => {
				let options = {
					method : 'GET',
					url : '/devices/' + funcName + '?deviceId=360043000a47343432313031&authtoken=bar'
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(417);
						expect(JSON.parse(response.payload).message).toBe('Error: HTTP error 422 from ' +
							response.request.server.methods.particle.config().baseUrl +
							'/v1/devices/360043000a47343432313031/' + varName);
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

			it('valid request returns 200 and numStrips value', (done) => {
				let options = {
					method : 'GET',
					url : '/devices/' + funcName + '?deviceId=360043000a47343432313031&authtoken=254406f79c1999af65a7df4388971354f85cfee9'
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(200);
						let payLoadJSON = JSON.parse(response.payload).body;
						if (payLoadJSON.name == 'int32') {
							expect(payLoadJSON.result).toBe(77); // nonsense val
						} else if (payLoadJSON.name == 'string') {
							expect(payLoadJSON.result).toBe('emulator v1_device_variables route'); // nonsense val
						}
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

		});
	} // end loop

	dynFuncNames = require('../../../src/modules/middleware/controllers/ledwax_device').dynamicFuncNames;
	for (let i = 0; i < dynFuncNames.iotFns.length; i++) {
		let funcName = dynFuncNames.iotFns[i].handlerFuncName;
		let varName = dynFuncNames.iotFns[i].iotFnName;
		describe('ledwax_device controller ' + funcName, () => {

			it('empty params returns 422 NOT OK', (done) => {
				let options = {
					method : 'POST',
					url : '/devices/' + funcName,
					payload : {}
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(422);
						expect(JSON.parse(response.payload).message).toBe('Error: child "authtoken" fails because ["authtoken" is required]');
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

			it('missing deviceId param returns 422 NOT OK', (done) => {
				let options = {
					method : 'POST',
					url : '/devices/' + funcName,
					payload : {
						authtoken : '254406f79c1999af65a7df4388971354f85cfee9'
					}
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(422);
						expect(JSON.parse(response.payload).message).toBe('Error: child "deviceId" fails because ["deviceId" is required]');
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

			it('missing authtoken param returns 422 NOT OK', (done) => {
				let options = {
					method : 'POST',
					url : '/devices/' + funcName,
					payload : {
						deviceId : '360043000a47343432313031'
					}
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(422);
						expect(JSON.parse(response.payload).message).toBe('Error: child "authtoken" fails because ["authtoken" is required]');
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

			it('invalid authtoken returns 417 Bad Expectation', (done) => {
				let options = {
					method : 'POST',
					url : '/devices/' + funcName,
					payload : {
						deviceId : '360043000a47343432313031',
						authtoken : 'foobar'
					}
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(417);
						expect(JSON.parse(response.payload).message).toBe('Error: HTTP error 422 from ' +
							response.request.server.methods.particle.config().baseUrl +
							'/v1/devices/360043000a47343432313031/' + varName);
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

			it('valid request returns 200 and ret val from func', (done) => {
				let options = {
					method : 'POST',
					url : '/devices/' + funcName,
					payload : {
						deviceId : '360043000a47343432313031',
						authtoken : '254406f79c1999af65a7df4388971354f85cfee9'
					}
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(200);
						let payLoadJSON = JSON.parse(response.payload).body;
						expect(payLoadJSON.return_value).toBe(1);
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

			it('accepts request with args returns 200 and ret val from func', (done) => {
				let options = {
					method : 'POST',
					url : '/devices/' + funcName,
					payload : {
						deviceId : '360043000a47343432313031',
						authtoken : '254406f79c1999af65a7df4388971354f85cfee9',
						args : 'foobar'
					}
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(200);
						let payLoadJSON = JSON.parse(response.payload).body;
						expect(payLoadJSON.return_value).toBe(1);
					} catch (e) {
						fail('unexpected error:\n' + e);
					}
					done();
				});
			});

		});
	} // end loop

});