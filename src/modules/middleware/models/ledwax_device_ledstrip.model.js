#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
	let ledwax_device_ledstrip = sequelize.define('ledwax_device_ledstrip', {
		deviceId : DataTypes.STRING,
		stripIndex : DataTypes.INTEGER,
		stripType : DataTypes.INTEGER,
		dispMode : DataTypes.INTEGER,
		modeColor : DataTypes.INTEGER,
		modeColorIdx : DataTypes.INTEGER,
		brightness : DataTypes.INTEGER,
		fadeMode : DataTypes.INTEGER,
		fadeTime : DataTypes.INTEGER,
		colorTime : DataTypes.INTEGER
	}, {
		classMethods : {
			associate : (models) => {
				return ledwax_device_ledstrip.belongsTo(models.ledwax_device);
			}
		}
	});
	return ledwax_device_ledstrip;
};