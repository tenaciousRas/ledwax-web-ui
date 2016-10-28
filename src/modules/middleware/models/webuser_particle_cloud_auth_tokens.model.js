#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
	let webuser_particle_cloud_auth_tokens = sequelize.define('webuser_particle_cloud_auth_tokens', {
		authtoken : DataTypes.STRING
	}, {
		classMethods : {
		}
	});
	return webuser_particle_cloud_auth_tokens;
};