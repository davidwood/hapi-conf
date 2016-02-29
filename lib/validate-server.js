'use strict';

/**
 * Imports
 */
const _ = require('lodash');

/**
 * Validate a server instance
 *
 * @param   {Object}    server      Hapi server
 */
module.exports = (server) => {
  if (!(server && _.isFunction(server.method))) {
    throw new TypeError('server.method is not a function');
  }
};
