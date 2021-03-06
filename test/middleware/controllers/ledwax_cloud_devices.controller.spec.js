#!/usr/bin/env node
'use strict';

const assert = require('assert');
let pg = require('pg');
const boom = require('boom');

const hcAuthToken = '254406f79c1999af65a7df4388971354f85cfee9';
const hcDeviceId = '460043000a47343432319876';

describe('api', () => {

	let server,
		db,
		particleCloud;

	beforeAll((done) => {
		server = require('../mockserver.js').createServer();
		// https://github.com/hapijs/hapi/issues/3017
		setTimeout(done, 2000);
	});

	describe('LedwaxCloudDeviceController#retrieveAllStoredDevices', () => {

		it('empty params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/retrieveAllStoredDevices'
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					expect(JSON.parse(response.payload).message).toBe('Error: child "sessiontoken" fails because ["sessiontoken" is required]');
					done();
				} catch (e) {
					fail('there was an unexpected error:\n' + e);
				}
			});
		});

		it('invalid params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/retrieveAllStoredDevices?foo=bar'
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					expect(JSON.parse(response.payload).message).toBe('Error: child "sessiontoken" fails because ["sessiontoken" is required]');
				} catch (e) {
					fail('there was an unexpected error:\n' + e);
				}
				done();
			});
		});

		it('valid params, empty table(s), responds with 200 OK and empty device list', (done) => {
			// delete all devices
			let db = server.plugins['hapi-sequelize']['apidb'];
			let device = db.getModel('ledwax_device');
			device.destroy({
				where : {
					id : {
						$gt : 0
					}
				},
				truncate : false //ignore where and truncate the table instead
			}).then((affectedRows) => {
				// inject request
				let options = {
					method : 'GET',
					url : '/devices/retrieveAllStoredDevices?sessiontoken=foobar&particleCloudId=1'
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(200);
						expect(JSON.parse(response.payload).length).toBe(0);
					} catch (e) {
						fail('there was an unexpected error:\n' + e);
					}
					done();
				});
			});
		});

		it('valid params, populated table(s), responds with 200 OK and populated device list', (done) => {
			// delete all devices
			let db = server.plugins['hapi-sequelize']['apidb'];
			let particleCloud = db.getModel('particle_cloud');
			let ledwaxDevice = db.getModel('ledwax_device');
			ledwaxDevice.destroy({
				where : {
					id : {
						$gt : 0
					}
				},
				truncate : false //ignore where and truncate the table instead
			}).then((affectedRows) => {
				let vals = {
					name : 'testfoo',
					ip : 'address.ip',
					port : 20000
				};
				// insert base particle cloud
				particleCloud.build(vals).save().then((particleCloud) => {
					// insert new device(s)
					vals = {
						particleCloudId : particleCloud.id,
						deviceId : 'foobar',
						numStrips : 2,
						stripIndex : 0,
						stripType : 1,
						dispMode : 2,
						modeColor : 234153,
						modeColorIdx : 0,
						brightness : 255,
						fadeMode : 0,
						fadeTime : 500,
						colorTime : 50000
					};
					ledwaxDevice.build(vals).save().then((device) => {
						// inject request
						let options = {
							method : 'GET',
							url : '/devices/retrieveAllStoredDevices?sessiontoken=foobar&particleCloudId=' + particleCloud.id
						};
						server.inject(options, (response) => {
							try {
								expect(response.statusCode).toBe(200);
								// console.log(response.payload);
								let ret = JSON.parse(response.payload)[0];
								expect(ret.deviceId).toBe(vals.deviceId);
								expect(ret.numStrips).toBe(vals.numStrips);
							} catch (e) {
								fail('there was an unexpected error:\n' + e);
							}
							done();
						});
					});
				});
			});
		});
	});

	describe('LedwaxCloudDeviceController#retrieveStoredDevice', () => {

		it('empty params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/retrieveStoredDevice'
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					expect(JSON.parse(response.payload).message).toBe('Error: child "sessiontoken" fails because ["sessiontoken" is required]');
				} catch (e) {
					fail('there was an unexpected error:\n' + e);
				}
				done();
			});
		});

		it('invalid params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/retrieveStoredDevice?foo=bar'
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					expect(JSON.parse(response.payload).message).toBe('Error: child "sessiontoken" fails because ["sessiontoken" is required]');
				} catch (e) {
					fail('there was an unexpected error:\n' + e);
				}
				done();
			});
		});

		it('missing particleCloudId param responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/retrieveStoredDevice?sessiontoken=foobar&deviceId=1'
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					expect(JSON.parse(response.payload).message).toBe('Error: child "particleCloudId" fails because ["particleCloudId" is required]');
				} catch (e) {
					fail('there was an unexpected error:\n' + e);
				}
				done();
			});
		});

		it('missing deviceId param responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/retrieveStoredDevice?sessiontoken=foobar&particleCloudId=1'
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					expect(JSON.parse(response.payload).message).toBe('Error: child "deviceId" fails because ["deviceId" is required]');
				} catch (e) {
					fail('there was an unexpected error:\n' + e);
				}
				done();
			});
		});

		it('valid params, empty table(s), responds with 200 OK and empty device', (done) => {
			// delete all devices
			let db = server.plugins['hapi-sequelize']['apidb'];
			let device = db.getModel('ledwax_device');
			device.destroy({
				where : {
					id : {
						$gt : 0
					}
				},
				truncate : false //ignore where and truncate the table instead
			}).then((affectedRows) => {
				// inject request
				let options = {
					method : 'GET',
					url : '/devices/retrieveStoredDevice?sessiontoken=foobar&deviceId=quuxcorge&particleCloudId=1'
				};

				server.inject(options, (response) => {
					try {
						expect(response.statusCode).toBe(200);
						expect(response.payload).toBe('{}');
					} catch (e) {
						fail('there was an unexpected error:\n' + e);
					}
					done();
				});
			});
		});

		it('valid params, populated table(s), responds with 200 OK and populated device', (done) => {
			// delete all devices
			let db = server.plugins['hapi-sequelize']['apidb'];
			let particleCloud = db.getModel('particle_cloud');
			let ledwaxDevice = db.getModel('ledwax_device');
			ledwaxDevice.destroy({
				where : {
					id : {
						$gt : 0
					}
				},
				truncate : false //ignore where and truncate the table instead
			}).then((affectedRows) => {
				let vals = {
					name : 'testfoo',
					ip : 'address.ip',
					port : 20000
				};
				// insert base particle cloud
				particleCloud.build(vals).save().then((particleCloud) => {
					// insert new device(s)
					vals = {
						particleCloudId : particleCloud.id,
						deviceId : 'foobar',
						numStrips : 2,
						stripIndex : 0,
						stripType : 1,
						dispMode : 2,
						modeColor : 234153,
						modeColorIdx : 0,
						brightness : 255,
						fadeMode : 0,
						fadeTime : 500,
						colorTime : 50000
					};
					ledwaxDevice.build(vals).save().then((device) => {
						// inject request
						let options = {
							method : 'GET',
							url : '/devices/retrieveStoredDevice?sessiontoken=foobar&deviceId=foobar&particleCloudId=' + particleCloud.id
						};
						server.inject(options, (response) => {
							try {
								expect(response.statusCode).toBe(200);
								expect(JSON.parse(response.payload).message).toBe(undefined);
								let ret = JSON.parse(response.payload);
								expect(ret.deviceId).toBe(vals.deviceId);
								expect(ret.numStrips).toBe(vals.numStrips);
							} catch (e) {
								fail('there was an unexpected error:\n' + e);
							}
							done();
						});
					});
				});
			});
		});
	});

	describe('LedwaxCloudDeviceController#saveDevice', () => {

		it('empty params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/devices/saveDevice',
				payload : {}
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					expect(JSON.parse(response.payload).message).toBe('Error: child "sessiontoken" fails because ["sessiontoken" is required]');
				} catch (e) {
					fail('there was an unexpected error:\n' + e);
				}
				done();
			});
		});

		it('invalid params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/devices/saveDevice',
				payload : {
					foo : 'bar'
				}
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					expect(JSON.parse(response.payload).message).toBe('Error: child "sessiontoken" fails because ["sessiontoken" is required]');
				} catch (e) {
					fail('there was an unexpected error:\n' + e);
				}
				done();
			});
		});

		it('missing particleCloudId param responds with 422 NOT OK', (done) => {
			let options = {
				method : 'POST',
				url : '/devices/saveDevice',
				payload : {
					foo : 'bar'
				}
			};

			server.inject(options, (response) => {
				try {
					expect(response.statusCode).toBe(422);
					expect(JSON.parse(response.payload).message).toBe('Error: child "sessiontoken" fails because ["sessiontoken" is required]');
				} catch (e) {
					fail('there was an unexpected error:\n' + e);
				}
				done();
			});
		});

		it('valid params, device already exists, performs update', (done) => {
			// delete all devices
			let db = server.plugins['hapi-sequelize']['apidb'];
			let particleCloud = db.getModel('particle_cloud');
			let ledwaxDevice = db.getModel('ledwax_device');
			ledwaxDevice.destroy({
				where : {
					id : {
						$gt : 0
					}
				},
				truncate : false //ignore where and truncate the table instead
			}).then((affectedRows) => {
				let vals = {
					name : 'testfoo',
					ip : 'address.ip',
					port : 20000
				};
				// insert base particle cloud
				particleCloud.build(vals).save().then((particleCloud) => {
					// insert new device(s)
					vals = {
						particleCloudId : particleCloud.id,
						deviceId : 'deviceFooId-1',
						numStrips : 2,
						stripIndex : 0,
						stripType : 1,
						dispMode : 2,
						modeColor : 234153,
						modeColorIdx : 0,
						brightness : 255,
						fadeMode : 0,
						fadeTime : 500,
						colorTime : 50000
					};
					ledwaxDevice.build(vals).save().then((device) => {
						// inject request
						let options = {
							method : 'POST',
							url : '/devices/saveDevice',
							payload : {
								id : device.id,
								sessiontoken : 'sessiontokenFoo',
								deviceId : vals.deviceId,
								particleCloudId : particleCloud.id,
								modeColorIndex : vals.modeColorIdx,
								color24Bit : vals.modeColor
							}
						};
						server.inject(options, (response) => {
							try {
								expect(response.statusCode).toBe(200);
								let ret = JSON.parse(response.payload);
								if (typeof ret.error != 'undefined') {
									fail('there was an error in the response\n' + response.payload);
								} else {
									expect(ret.length).toBe(1);
								}
							} catch (e) {
								fail('there was an unexpected error:\n' + e);
							}
							done();
						});
					});
				});
			});
		});

		it('valid params, device not saved already, responds with 200 OK and saved device', (done) => {
			// delete all devices
			let db = server.plugins['hapi-sequelize']['apidb'];
			let particleCloud = db.getModel('particle_cloud');
			let ledwaxDevice = db.getModel('ledwax_device');
			ledwaxDevice.destroy({
				where : {
					id : {
						$gt : 0
					}
				},
				truncate : false //ignore where and truncate the table instead
			}).then((affectedRows) => {
				let vals = {
					name : 'testfoo',
					ip : 'address.ip',
					port : 20000
				};
				// insert base particle cloud
				particleCloud.build(vals).save().then((particleCloud) => {
					// inject request
					let options = {
						method : 'POST',
						url : '/devices/saveDevice',
						payload : {
							sessiontoken : 'sessiontokenFoo',
							particleCloudId : particleCloud.id,
							deviceId : 'deviceFooId-2',
							numStrips : 2,
							stripIndex : 0,
							stripType : 1,
							dispMode : 2,
							color24Bit : 234153,
							modeColorIndex : 0,
							brightness : 255,
							fadeMode : 0,
							fadeTimeInterval : 500,
							colorHoldTime : 50000
						}
					};

					server.inject(options, (response) => {
						try {
							expect(response.statusCode).toBe(200);
							let ret = JSON.parse(response.payload);
							if (typeof ret.error != 'undefined') {
								fail('there was an error in the response\n' + response.payload);
								done();
							} else {
								// check the saved device
								ledwaxDevice.find({
									where : {
										id : ret.id
									},
								}).then((device) => {
									expect(ret.deviceId).toBe(options.payload.deviceId);
									expect(ret.particleCloudId).toBe(particleCloud.id);
									expect(device.numStrips).toBe(options.payload.numStrips);
									done();
								});
							}
						} catch (e) {
							fail('there was an unexpected error:\n' + e);
						}
					});
				});
			});
		});

	});

	describe('LedwaxCloudDeviceController#saveDeviceANDSaveLEDStrips', () => {
		it('valid params, device not saved already, responds with 200 OK and saved device', (done) => {
			// delete all devices
			let db = server.plugins['hapi-sequelize']['apidb'];
			let particleCloud = db.getModel('particle_cloud');
			let ledwaxDevice = db.getModel('ledwax_device');
			ledwaxDevice.destroy({
				where : {
					id : {
						$gt : 0
					}
				},
				truncate : false //ignore where and truncate the table instead
			}).then((affectedRows) => {
				let vals = {
					name : 'testfoo',
					ip : 'address.ip',
					port : 20000
				};
				// insert base particle cloud
				particleCloud.build(vals).save().then((particleCloud) => {
					// inject request
					let options = {
						method : 'POST',
						url : '/devices/saveDeviceANDLEDStrips',
						payload : {
							sessiontoken : hcAuthToken,
							authtoken : hcAuthToken,
							particleCloudId : particleCloud.id,
							deviceId : hcDeviceId,
							numStrips : 3,
							stripIndex : 0,
							stripType : 1,
							dispMode : 2,
							color24Bit : 234153,
							modeColorIndex : 0,
							brightness : 255,
							fadeMode : 0,
							fadeTimeInterval : 500,
							colorHoldTime : 50000
						}
					};

					server.inject(options, (response) => {
						try {
							expect(response.statusCode).toBe(200);
							let ret = JSON.parse(response.payload);
							if (typeof ret.error != 'undefined') {
								fail('there was an error in the response\n' + response.payload);
								done();
							} else {
								// check the saved device
								ledwaxDevice.find({
									where : {
										id : ret.id
									},
								}).then((device) => {
									expect(ret.deviceId).toBe(options.payload.deviceId);
									expect(ret.particleCloudId).toBe(particleCloud.id);
									expect(device.numStrips).toBe(options.payload.numStrips);
									expect(ret.ledStrips.length).toBe(3);
									done();
								});
							}
						} catch (e) {
							fail('there was an unexpected error:\n' + e);
						}
					});
				});
			});
		});
		
	});
});