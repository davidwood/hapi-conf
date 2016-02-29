'use strict';

/**
 * Imports
 */
const _ = require('lodash');
const filterEnv = require('filter-env');
const dotenv = require('dotenv');

/**
 * Load and expose the environment configuration
 *
 * @param   {Object}          server      Hapi server
 * @param   {RegExp|Function} validate    Validation function or regular expression
 * @param   {Object}          [options]   Optional options
 */
module.exports = (server, validate, options) => {
  if (!(server && _.isFunction(server.method))) {
    throw new TypeError('server.method is not a function');
  }
  let env = filterEnv(validate, options);
  if (options && !_.isNil(options.env)) {
    if (_.isString(options.env) || Buffer.isBuffer(options.env)) {
      const filtered = filterEnv.filter(dotenv.parse(options.env), validate, options);
      const isFrozen = Object.isFrozen(env);
      env = _.defaults({}, env, filtered);
      if (isFrozen) {
        Object.freeze(env);
      }
    } else {
      throw new TypeError('options.env is not a string or Buffer');
    }
  }
  server.method('getConfig', (key) => {
    let value;
    if (_.isString(key)) {
      value = env[key];
    }
    return value;
  });
};
