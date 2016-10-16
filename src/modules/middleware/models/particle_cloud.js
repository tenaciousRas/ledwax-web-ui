#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
  var particle_cloud = sequelize.define('particle_cloud', {
    id: DataTypes.INT,
    name: DataTypes.STRING,
    ip: DataTypes.STRING
  }, {
    classMethods: {
      associate: (models) => {
        // associations can be defined here
      }
    }
  });
  return particle_cloud;
};
