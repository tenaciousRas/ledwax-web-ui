'use strict';

/**
 * Seed DB tables.  Must be run before starting application for 
 * first time.  Will seed the database as given by LEDWAX_ENVIRO
 * environment variable.
 * To run: node ./scripts/seed_db.js
 * LEDWAX_ENVIRO=dev && node ./scripts/seed_db.js
 */
let args = require('yargs').argv;
const rt_ctx_env = args.env || process.env.NODE_ENV || process.env.LEDWAX_ENVIRO || 'dev';
const hapiConfig = require('../src/config/app.config')[rt_ctx_env];
const particlewrap = require('particle-api-js');
const particle_config = require('../src/particle-config').attributes[rt_ctx_env];
const util = require('../src/util');

module.exports = {
	buildRecords : function() {
		let ret = [];
		ret.push({});
		let tmp = util.extractIPPortFromURL(particle_config.baseUrl);
		ret[0].name = particle_config.name;
		ret[0].ip = tmp.ip;
		ret[0].port = null;
		ret[0].createdAt = new Date();
		ret[0].updatedAt = new Date();
		return ret;
	},
	up : function(queryInterface, Sequelize) {
		/**
		 * Add altering commands here.
		 * Return a promise to correctly handle asynchronicity.
		 */
		let records = this.buildRecords();
		console.log(rt_ctx_env + ' mode, creating ' + records.length + ' records\n');
		return queryInterface.bulkInsert('particle_clouds', records, {});
	},

	down : function(queryInterface, Sequelize) {
		/*
		  Add reverting commands here.
		  Return a promise to correctly handle asynchronicity.

		  Example:
		  return queryInterface.bulkDelete('Person', null, {});
		*/
	}
};