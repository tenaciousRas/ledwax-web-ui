#!/usr/bin/env node
'use strict';

const Path = require('path');
const hapiplugins = require('./plugins');
const internals = hapiplugins.internals

// export server config settings
module.exports = {
	dev : {
		application : {
			server : {
				debug : {
					log : [ 'error', 'debug', 'warn', 'info' ],
					request : [ 'error', 'debug', 'warn', 'info' ]
				}
			// TODO: cache, cors, etc
			},
			connections : [
				{
					port : process.env.LEDWAX_WEB_PORT || 8000,
					labels : [ 'web' ],
					routes : {
						log : true,
						auth : false,
						files : {
							// serves static content files from this directory
							relativeTo : Path.join(__dirname,
								internals.staticContentPath)
						}
					}
				}, {
					port : process.env.LEDWAX_API_PORT || 3000,
					labels : [ 'api' ],
					routes : {
						log : true,
						validate : {
							options : {
								// ignores unknown json props and doesnt
								// validate them
								allowUnknown : false
							}
						},
						cors : {
							origin : [ '*' ]
						}
					}
				} ],
			registrations : hapiplugins.plugins
		}
	},
	dev_debug : {
		application : {
			server : {
				debug : {
					log : [ 'error', 'debug', 'warn', 'info' ],
					request : [ 'error', 'debug', 'warn', 'info' ]
				}
			// TODO: cache, cors, etc
			},
			connections : [
				{
					port : process.env.LEDWAX_WEB_PORT || 8000,
					labels : [ 'web' ],
					routes : {
						log : true,
						files : {
							// serves static content files from this directory
							relativeTo : Path.join(__dirname,
								internals.staticContentPath)
						}
					}
				}, {
					port : process.env.LEDWAX_API_PORT || 3000,
					labels : [ 'api' ],
					routes : {
						log : true,
						validate : {
							options : {
								// ignores unknown json props and doesnt
								// validate them
								allowUnknown : false
							}
						},
						cors : {
							origin : [ '*' ]
						}
					}
				} ],
			registrations : hapiplugins.plugins
		}
	},
	test : {
		application : {
			server : {
				debug : {
					log : [ 'error', 'debug', 'warn', 'info' ],
					request : [ 'error', 'debug', 'warn', 'info' ]
				}
			// TODO: cache, cors, etc
			},
			connections : [
				{
					port : process.env.LEDWAX_WEB_PORT || 8000,
					labels : [ 'web' ],
					routes : {
						log : true,
						files : {
							// serves static content files from this directory
							relativeTo : Path.join(__dirname,
								internals.staticContentPath)
						}
					}
				}, {
					port : process.env.LEDWAX_API_PORT || 3000,
					labels : [ 'api' ],
					routes : {
						log : true,
						validate : {
							options : {
								// ignores unknown json props and doesnt
								// validate them
								allowUnknown : false
							}
						},
						cors : {
							origin : [ '*' ]
						}
					}
				} ],
			registrations : hapiplugins.plugins
		}
	},
	production : {
		application : {
			server : {
				debug : {
					log : [ 'error', 'debug', 'warn', 'info' ],
					request : [ 'error', 'debug', 'warn', 'info' ]
				}
			// TODO: cache, cors, etc
			},
			connections : [
				{
					port : process.env.LEDWAX_WEB_PORT || 8000,
					labels : [ 'web' ],
					routes : {
						log : true,
						files : {
							// serves static content files from this directory
							relativeTo : Path.join(__dirname,
								internals.staticContentPath)
						}
					}
				}, {
					port : process.env.LEDWAX_API_PORT || 3000,
					labels : [ 'api' ],
					routes : {
						log : true,
						validate : {
							options : {
								// ignores unknown json props and doesnt
								// validate them
								allowUnknown : true
							}
						},
						cors : {
							origin : [ '*' ]
						}
					}
				} ],
			registrations : hapiplugins.plugins
		}
	}
};