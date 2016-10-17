#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
  let storeduser_tokens = sequelize.define('storeduser_tokens', {
    username: DataTypes.STRING,
    pwd: DataTypes.STRING,
    authtoken: DataTypes.STRING,
    cookietoken: DataTypes.STRING
  }, {
    classMethods: {
      associate: (models) => {
        return storeduser_tokens.belongsTo(models.particle_cloud);
      }
    }
  });
  return storeduser_tokens;
};
