#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
  let ledwax_device = sequelize.define('ledwax_device', {
    device_id: DataTypes.STRING
  }, {
    classMethods: {
      associate: (models) => {
        return ledwax_device.belongsTo(models.particle_cloud);
      }
    }
  });
  return ledwax_device;
};
