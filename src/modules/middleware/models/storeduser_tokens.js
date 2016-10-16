#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
  var storeduser_tokens = sequelize.define('storeduser_tokens', {
    username: DataTypes.STRING,
    pwd: DataTypes.STRING,
    authtoken: DataTypes.STRING,
    cookietoken: DataTypes.STRING
  }, {
    classMethods: {
      associate: (models) => {
        // associations can be defined here
      }
    }
  });
  return storeduser_tokens;
};
