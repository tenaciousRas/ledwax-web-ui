#!/usr/bin/env node
'use strict';

const LedWaxPersistence = () => {
	/**
	 * Persist a new user login to database.
	 */
	const persistLogin = (db, cloudModel, username, authtoken, sessiontoken, log) => {
		let user = db.getModel('webuser');
		try {
			cloudModel.getWebuser({
				where : 'sessiontoken = ' + sessiontoken
			}).then(
				(user) => {
					if (null == user) {
						// create new webuser record
						let vals = {
							username : username,
							sessiontoken : sessiontoken,
						};
						try {
							user.build(vals);
							user.addParticle_Clouds(cloudModel, {
								authtoken : authtoken
							});
							user.save().then((user) => {
								log([ 'debug', 'LedWaxPersistence#getLEDWaxDevices' ],
									'DB call complete - update promise success, user =:' + user);
								return user;
							});
						} catch (e) {
							log([ 'debug', 'LedWaxPersistence#getLEDWaxDevices' ],
								'API call complete - promise error:\n' + err);
							throw e;
						}
					} else {
						// update existing webuser record
						user.sessiontoken = ct;
						user.setParticle_Clouds(cloudModel, {
							authtoken : authtoken
						});
						user.save({
							fields : [ 'sessiontoken' ]
						}).then((user) => {
							log([ 'debug', 'LedWaxPersistence#getLEDWaxDevices' ],
								'DB call complete - update promise success, user =:' + user);
							return reply(user);
						});
					}
				}
			);
		} catch (e) {
			throw e;
		}
	};

	const getLEDWaxDevices = (db, cloudModel) => {
		let ledwaxDevice = db.getModel('ledwax_device');
	//    try {
	//      cloudModel.getLEDWax_devices();
	//        }).then((associated) => {
	//  	    	log('debug', 'LedWaxPersistence#getLEDWaxDevices',
	//  						'DB call complete - promise success, data =:' + associated);
	//          if (null == associated) {
	//            return null;
	//          }
	//  				return associated;
	//        });
	//    } catch (e) {
	//      throw e;
	//    }
	};

	const persistLEDWaxDevice = (db, cloudModel, ledWaxDevice, log) => {
		try {
			ledWaxDevice.build(vals);
			ledWaxDevice.setParticle_Cloud(cloudModel);
			ledWaxDevice.save().then((data) => {
				log([ 'debug', 'LedWaxPersistence#getLEDWaxDevices' ],
					'DB call complete - update promise success, data =:' + data);
				return user;
			});
		} catch (e) {
			log([ 'debug', 'LedWaxPersistence#getLEDWaxDevices' ],
				'API call complete - promise error:\n' + err);
			throw e;
		}
	};

	// expose public methods
	return {
		persistLogin : persistLogin,
		getLEDWaxDevices : getLEDWaxDevices,
		persistLEDWaxDevice : persistLEDWaxDevice
	};

};
module.exports = LedWaxPersistence();