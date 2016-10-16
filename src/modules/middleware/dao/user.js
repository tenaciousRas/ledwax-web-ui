#!/usr/bin/env node
'use strict';

let UserDAO = (sequelize) => {
  const sequelize = sequelize;
};
UserDAO.prototype = ( () => {

	return {
    findAll: (client) => {
  		let select = 'SELECT * FROM storedusertokens';
      let promise = client.query(select), (err, result) => {
  			if(err) return reply(boom.badImplementation('There was an internal error', err));
  			if (!result) return reply({rows: []});
  	    return reply(result.rows[0]);
  	  });
    },
		findByCookie: (email, password, callback) => {
			var values = [
				email,
				password
			];

			var sql = 'SELECT * FROM storedusertokens AS u '+
				'WHERE u.cookietoken = ? ';

			db.query({
				sql : sql,
				values: values,
				callback : callback
			});
		}
	};
})();

let userDAO = new UserDAO();
module.exports = userDAO;
