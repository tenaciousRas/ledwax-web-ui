#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
  let ledwax_device = sequelize.define('ledwax_device', {
    deviceId: DataTypes.STRING,
    numStrips: DataTypes.INTEGER,
    stripIndex: DataTypes.INTEGER,
    stripType: DataTypes.INTEGER,
    dispMode: DataTypes.INTEGER,
    modeColor: DataTypes.INTEGER,
    modeColorIdx: DataTypes.INTEGER,
    brightness: DataTypes.INTEGER,
    fadeMode: DataTypes.INTEGER,
    fadeTime: DataTypes.INTEGER,
    colorTime: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: (models) => {
        return ledwax_device.belongsTo(models.particle_cloud);
      }
    }
  });
  return ledwax_device;
};
