#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
	let ledwax_device = sequelize.define('ledwax_device', {
		deviceId : DataTypes.STRING,
		numStrips : DataTypes.INTEGER
	}, {
		classMethods : {
			associate : (models) => {
				return ledwax_device.belongsTo(models.particle_cloud);
			}
		}
	});
	return ledwax_device;
};