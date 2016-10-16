#!/usr/bin/env node
'use strict';

const rt_ctx_env = process.env.LEDWAX_ENVIRO || 'dev';

Class HapiConfig {
  let options = {};
  let currentConfig = {};

  /**
	 * Constructor for the HapiConfig wrapper.
	 *
	 * Create a new HapiConfig object and call methods below on it.
	 *
	 * @param  {Object} options Options to be used for all requests (see [pathname](path_to_src))
	 */
  constructor(server, options = {enviro: rt_ctx_env}) {
  		Object.assign(this.options, options);
      currentConfig = this.buildConfig(this.options.enviro);
  }

  const buildConfig = (enviro = this.options.enviro) => {
    let ret = {};
    let appConfig = require(rt_ctx_env);
    appConfig.particleConfig = require('particle_config').attributes[rt_ctx_env];
    return ret;
  }

  const getConfig = (enviro = this.options.enviro) => {
    return currentConfig;
  }

  server.method({
      name: 'getConfig',
      method: this.getConfig,
      options: {}
  });
}

export default HapiConfig;
