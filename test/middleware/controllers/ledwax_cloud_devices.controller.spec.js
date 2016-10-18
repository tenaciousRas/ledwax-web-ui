#!/usr/bin/env node
'use strict';

const assert = require('assert');
let pg = require('pg');
const boom = require('boom');

describe('api', () => {

	let server, db, particleConfig, particleCloud;

	beforeAll((done) => {
		server = require('../mockserver.js').createServer();
		particleConfig = server.methods.particle.config();
    // https://github.com/hapijs/hapi/issues/3017
    setTimeout(done, 2000);
	});

	describe('LedwaxCloudDeviceController#retrieveStoredDevices', () => {

		it('empty params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/retrieveStoredDevices'
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(JSON.parse(response.payload).message).toBe('Error: child "cookietoken" fails because ["cookietoken" is required]');
				done();
			});
		});

		it('invalid params responds with 422 NOT OK', (done) => {
			let options = {
				method : 'GET',
				url : '/devices/retrieveStoredDevices?foo=bar'
			};

			server.inject(options, (response) => {
				expect(response.statusCode).toBe(422);
				expect(JSON.parse(response.payload).message).toBe('Error: child "cookietoken" fails because ["cookietoken" is required]');
				done();
			});
		});

		it('valid params, empty table(s), responds with 200 OK and empty device list', (done) => {
      // delete all users
      let db = server.plugins['hapi-sequelize']['apidb'];
      let device = db.getModel('ledwax_device');
      device.destroy({
        where: {
          username: 'foo'
        },
        truncate: true  //ignore where and truncate the table instead
      }).then((affectedRows) => {
        // inject request
  			let options = {
  				method : 'GET',
  				url : '/devices/retrieveStoredDevices?cookietoken=foobar&particleCloudId=1'
  			};

  			server.inject(options, (response) => {
  				expect(response.statusCode).toBe(200);
  				// expect(JSON.parse(response.payload).message).toBe('Error: child "cookietoken" fails because ["cookietoken" is required]');
  				done();
  			});
      });
		});

		it('valid params, populated table(s), responds with 200 OK and populated device list', (done) => {
      // delete all users
      let db = server.plugins['hapi-sequelize']['apidb'];
      let particleCloud = db.getModel('particle_cloud');
      let ledwaxDevice = db.getModel('ledwax_device');
      ledwaxDevice.destroy({
        where: {
          id: 'foo'
        },
        truncate: true  //ignore where and truncate the table instead
      }).then((affectedRows) => {
          let vals = {
            name: 'testfoo',
            ip: 'address.ip',
            port: 20000
          };
          // insert base particle cloud
          particleCloud.build(vals).save().then((particleCloud) => {
            // insert new device(s)
            vals = {
              particleCloudId: particleCloud.id,
              deviceId: 'foobar',
              numStrips: 2,
              stripIndex: 0,
              stripType: 1,
              dispMode: 2,
              modeColor: 234153,
              modeColorIdx: 0,
              brightness: 255,
              fadeMode: 0,
              fadeTime: 500,
              colorTime: 50000
            };
            ledwaxDevice.build(vals).save().then((device) => {
              // inject request
        			let options = {
        				method : 'GET',
  				      url : '/devices/retrieveStoredDevices?cookietoken=foobar&particleCloudId=' + particleCloud.id
        			};
        			server.inject(options, (response) => {
        				expect(response.statusCode).toBe(200);
         				expect(JSON.parse(response.payload).deviceId).toBe(vals.deviceId);
                try {
                  ledwaxDevice.find({
                    where: {deviceId: vals.deviceId, particleCloudId: particleCloud.id},
                    }).then((device) => {
          				    expect(device.numStrips).toBe(vals.numStrips);
          				    expect(device.stripIndex).toBe(vals.stripIndex);
          				    expect(device.stripType).toBe(vals.stripType);
          				    expect(device.dispMode).toBe(vals.dispMode);
          				    expect(device.modeColor).toBe(vals.modeColor);
          				    expect(device.modeColorIdx).toBe(vals.modeColorIdx);
          				    expect(device.brightness).toBe(vals.brightness);
          				    expect(device.fadeMode).toBe(vals.fadeMode);
          				    expect(device.fadeTime).toBe(vals.fadeTime);
          				    expect(device.colorTime).toBe(vals.colorTime);
          				    done();
                  });
                } catch (e) {
                  fail(e);
                }
        			});
            });
        });
		  });
    });
  });
});
