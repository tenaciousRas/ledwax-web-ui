#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
  var ledwax_device = sequelize.define('ledwax_device', {
    id: DataTypes.INT,
    device_id: DataTypes.STRING
  }, {
    classMethods: {
      associate: (models) => {
        // associations can be defined here
      }
    }
  });
  return ledwax_device;
};
