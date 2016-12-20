#!/usr/bin/env node
'use strict';

module.exports = (sequelize, DataTypes) => {
	var particle_cloud = sequelize.define('particle_cloud', {
		name : DataTypes.STRING,
		ip : DataTypes.STRING,
		port : DataTypes.INTEGER,
		client_secret : DataTypes.STRING,
		client_id : DataTypes.STRING,
		token_duration : DataTypes.INTEGER
	}, {
		classMethods : {
			associate : (models) => {
				particle_cloud.hasMany(models.ledwax_device);
				return particle_cloud.belongsToMany(models.webuser, {
					through : models.webuser_particle_cloud_auth_tokens
				});
			}
		}
	});
	return particle_cloud;
};