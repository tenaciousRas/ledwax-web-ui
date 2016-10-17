#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
  var particle_cloud = sequelize.define('particle_cloud', {
    name: DataTypes.STRING,
    ip: DataTypes.STRING,
    port: DataTypes.STRING
  }, {
    classMethods: {
      associate: (models) => {
      }
    }
  });
  return particle_cloud;
};
