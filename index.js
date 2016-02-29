'use strict';

/**
 * Imports
 */
const validateServer = require('./lib/validate-server');
const load = require('./lib/load-env');
const expose = require('./lib/expose-config');

/**
 * Load and expose the environment configuration
 *
 * @param   {Object}          server      Hapi server
 * @param   {RegExp|Function} validate    Validation function or regular expression
 * @param   {Object}          [options]   Optional options
 */
module.exports = (server, validate, options) => {
  validateServer(server);
  const env = load(validate, options);
  expose(server, env);
};

/**
 * Export load and expose
 */
module.exports.load = load;
module.exports.expose = expose;
