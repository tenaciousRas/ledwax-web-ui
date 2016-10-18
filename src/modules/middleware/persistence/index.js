#!/usr/bin/env node
'use strict';

const LedWaxPersistence = () {
	/**
	 * Persist a new user login to database.
	 */
	const persistLogin = (db, cloudModel, username, password, authtoken, cookietoken, log) => {
    let user = db.getModel('storeduser_tokens');
    try {
      cloudModel.getStoreduser_tokens({ where: 'cookietoken = ' + cookietoken }).then(
        (user) => {
          if (null == user) {
            let vals = {
              username: username,
          		pwd: password,
          		authtoken: authtoken,
          		cookietoken: cookietoken,
            };
            try {
              stuser.build(vals);
              stuser.setParticle_Cloud(cloudModel);
              stuser.save().then((user) => {
        	    	log(['debug', 'LedWaxPersistence#getLEDWaxDevices'],
        						'DB call complete - update promise success, user =:' + user);
                return user;
              });
            } catch (e) {
      	    	log(['debug', 'LedWaxPersistence#getLEDWaxDevices'],
      						'API call complete - promise error:\n' + err);
                throw e;
            }
            // create new storeduser_tokens record
          } else {
            // update existing storeduser_tokens record
            user.cookietoken = ct;
            user.save({fields: ['cookietoken']}).then((user) => {
    	    	log(['debug', 'LedWaxPersistence#getLEDWaxDevices'],
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
    try {
      cloudModel.getLEDWax_devices();
        }).then((associated) => {
  	    	log('debug', 'LedWaxPersistence#getLEDWaxDevices',
  						'DB call complete - promise success, data =:' + associated);
          if (null == associated) {
            return null;
          }
  				return associated;
        });
    } catch (e) {
      throw e;
    }
  };

	const persistLEDWaxDevice = (db, cloudModel, ledWaxDevice, log) => {
    try {
      ledWaxDevice.build(vals);
      ledWaxDevice.setParticle_Cloud(cloudModel);
      ledWaxDevice.save().then((data) => {
	    	log(['debug', 'LedWaxPersistence#getLEDWaxDevices'],
						'DB call complete - update promise success, data =:' + data);
        return user;
      });
    } catch (e) {
    	log(['debug', 'LedWaxPersistence#getLEDWaxDevices'],
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
