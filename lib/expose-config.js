'use strict';

/**
 * Imports
 */
const _ = require('lodash');
const validateServer = require('./validate-server');

/**
 * Expose configuration as a server method
 *
 * @param   {Object}    server      Hapi server
 * @param   {Object}    config      Environment configuration
 */
module.exports = (server, config) => {
  validateServer(server);
  if (!config) {
    throw new TypeError('Invalid environment configuration');
  }
  server.method('getConfig', (key) => {
    let value;
    if (_.isString(key)) {
      value = config[key];
    }
    return value;
  });
};
