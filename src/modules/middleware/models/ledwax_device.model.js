#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
	let ledwax_device = sequelize.define('ledwax_device', {
		deviceId : DataTypes.STRING,
		numStrips : DataTypes.INTEGER,
		deviceNameFW : DataTypes.STRING
	}, {
		classMethods : {
			associate : (models) => {
				ledwax_device.hasMany(models.ledwax_device_ledstrip);
				return ledwax_device.belongsTo(models.particle_cloud);
			}
		}
	});
	return ledwax_device;
};