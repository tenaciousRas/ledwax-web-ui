#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
	let webuser = sequelize.define('webuser', {
		username : DataTypes.STRING,
		sessiontoken : DataTypes.STRING,
		last_login : DataTypes.DATE,
		sessiontoken_ttl : DataTypes.INTEGER
	}, {
		classMethods : {
			associate : (models) => {
				return webuser.belongsToMany(models.particle_cloud, {
					through : models.webuser_particle_cloud_auth_tokens
				});
			}
		}
	});
	return webuser;
};