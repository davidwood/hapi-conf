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
 * @returns {Object}          loaded environment configuration
 */
module.exports = (validate, options) => {
  let config = filterEnv(validate, options);
  if (options && !_.isNil(options.env)) {
    if (_.isString(options.env) || Buffer.isBuffer(options.env)) {
      const filtered = filterEnv.filter(dotenv.parse(options.env), validate, options);
      const isFrozen = Object.isFrozen(config);
      config = _.defaults({}, config, filtered);
      if (isFrozen) {
        Object.freeze(config);
      }
    } else {
      throw new TypeError('options.env is not a string or Buffer');
    }
  }
  return config;
};
