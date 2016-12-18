'use strict';
module.exports = {
	up : function(queryInterface, Sequelize) {
		return queryInterface.createTable('particle_clouds', {
			id : {
				allowNull : false,
				autoIncrement : true,
				primaryKey : true,
				type : Sequelize.INTEGER
			},
			id : {
				type : Sequelize.INTEGER
			},
			name : {
				type : Sequelize.STRING
			},
			ip : {
				type : Sequelize.STRING
			},
			client_secret : {
				type : Sequelize.STRING
			},
			client_id : {
				type : Sequelize.STRING
			},
			token_duration : {
				type : Sequelize.INTEGER
			},
			created_at : {
				allowNull : false,
				type : Sequelize.DATE
			},
			updated_at : {
				allowNull : false,
				type : Sequelize.DATE
			}
		});
	},
	down : function(queryInterface, Sequelize) {
		return queryInterface.dropTable('particle_clouds');
	}
};