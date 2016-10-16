#!/usr/bin/env node
'use strict';

const assert = require('assert');
const boom = require('boom');

/**
 * User controller to manage locally stored users.
 */
const UserController = () => {

	/**
	 * Returns a user given cookie token
	 */
	const retrieveByCookie = (request, reply) => {
		let ct = request.payload ? request.payload.cookietoken : request.query.cookietoken;
    let db = request.getDb('apidb');
    let stuser = db.getModel('storeduser_tokens');
    try {
      stuser.findOne({
        where: {cookietoken: ct},
        }).then((user) => {
  	    	request.server.log(['debug', 'user.contoller'],
  						'DB call complete - promise success, user =:' + user);
          if (null == user) {
            return reply(boom.notFound(ct));
          }
  				return reply(user);
        });
    } catch (e) {
      return reply(boom.badImplementation('unable to find user', e));
    }
	};

	/**
	 * Create a new user in the DB with a unique authtoken.
	 */
	const create = (request, reply) => {
    let db = request.getDb('apidb');
    let stuser = db.getModel('storeduser_tokens');
    let vals = {
      username: request.payload.username,
  		pwd: request.payload.password,
  		authtoken: request.payload.authtoken,
  		cookietoken: request.payload.cookietoken
    };
    try {
      stuser.build(vals).
        save().then((user) => { reply('foo'); });
    } catch (e) {
      console.log(e);
      return reply(boom.badImplementation('unable to create user', e));
    }
	};

	/**
	 * Updates a user's cookietoken with a new and unique cookietoken.
	 */
	const updateCookie = (request, reply) => {
    let db = request.getDb('apidb');
		let ct = request.payload.cookietoken;
		let at = request.payload.authtoken;
    let stuser = db.getModel('storeduser_tokens');
    try {
      stuser.findOne({
        where: {cookietoken: ct},
        }).then((user) => {
  	    	request.server.log(['debug', 'user.contoller'],
  						'DB call complete - promise success, user =:' + user);
          if (null == user) {
            return reply(boom.notFound(ct));
          }
          user.save({fields: ['cookietoken']}).then(() => {
  				  return reply(user);
          });
      });
    } catch (e) {
      return reply(boom.badImplementation('unable to update user', e));
    }
	};

	return {
		findCookie : retrieveByCookie,
		insert : create,
		updateCookie : updateCookie
	};

};

module.exports = UserController();
