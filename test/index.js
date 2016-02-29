'use strict';

/**
 * Imports
 */
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const _ = require('lodash');
const hapiConf = require('../');
const load = require('../lib/load-env');
const expose = require('../lib/expose-config');

/**
 * Constants
 */
const NOOP = () => {}; // eslint-disable-line
const ENV_PATH = path.join(__dirname, 'fixtures', 'env.txt');

describe('hapiConf(server, validate, [options])', () => {
  before(() => {
    process.env.TEST_STRING_VALUE = 'TestString';
    process.env.TEST_NUMBER_VALUE = '123.45';
    process.env.TEST_INTEGER_VALUE = 123;
    process.env.TEST_ARRAY_VALUE = '["alpha","bravo","charlie"]';
    process.env.TEST_OBJECT_VALUE = '{"alpha":"a","bravo":{"charlie":"c","delta":"d"},"echo":"e"}';
    process.env.TEST_EMPTY_VALUE = '';
    process.env.BAD_OBJECT_VALUE = '{"alpha": "a",';
    process.env.BAD_ARRAY_VALUE = '["alpha",';
  });

  it('should export a function', () => {
    assert.strictEqual(typeof hapiConf === 'function', true);
  });

  it('should export the load and expose functions', () => {
    assert.strictEqual(hapiConf.load, load);
    assert.strictEqual(hapiConf.expose, expose);
  });

  it('should throw an error if the Hapi server is invalid', () => {
    const values = [true, false, '', 'test', 123, new Date(), {}, [], null, undefined, /test/i];
    values.forEach((value) => {
      let error;
      try {
        hapiConf({ method: value });
      } catch (e) {
        error = e;
      }
      assert.strictEqual(error instanceof TypeError, true);
      assert.strictEqual(error.message, 'server.method is not a function');
    });
    values.push(NOOP);
    values.forEach((value) => {
      let error;
      try {
        hapiConf(value);
      } catch (e) {
        error = e;
      }
      assert.strictEqual(error instanceof TypeError, true);
      assert.strictEqual(error.message, 'server.method is not a function');
    });
  });

  it('should throw an error if the validation function is not a valid function', () => {
    [true, false, '', 123, new Date(), {}, [], null, undefined].forEach((value) => {
      let error;
      try {
        hapiConf({ method: NOOP }, value);
      } catch (e) {
        error = e;
      }
      assert.strictEqual(error instanceof TypeError, true);
      assert.strictEqual(error.message, 'Invalid validation function');
    });
  });

  it('should add a server method "getConfig" that returns valid configuration values', (done) => {
    const expected = {
      TEST_STRING_VALUE: 'TestString',
      TEST_NUMBER_VALUE: '123.45',
      TEST_INTEGER_VALUE: '123',
      TEST_ARRAY_VALUE: '["alpha","bravo","charlie"]',
      TEST_EMPTY_VALUE: '',
      TEST_OBJECT_VALUE: '{"alpha":"a","bravo":{"charlie":"c","delta":"d"},"echo":"e"}',
    };
    const method = (name, get) => {
      assert.strictEqual(name, 'getConfig');
      _.each(expected, (value, key) => {
        assert.strictEqual(get(key), value);
      });
      done();
    };
    hapiConf({ method }, /^test_/i);
  });

  it('should throw an error if the environment to load is not a string or buffer', () => {
    [true, false, 123, new Date(), {}, [], /test/i, NOOP].forEach((value) => {
      let error;
      try {
        hapiConf({ method: NOOP }, /^test_/i, { env: value });
      } catch (e) {
        error = e;
      }
      assert.strictEqual(error instanceof TypeError, true);
      assert.strictEqual(error.message, 'options.env is not a string or Buffer');
    });
  });

  it('should load an external environment as a string', (done) => {
    const expected = {
      TEST_STRING_VALUE: 'TestString',
      TEST_NUMBER_VALUE: '123.45',
      TEST_INTEGER_VALUE: '123',
      TEST_ARRAY_VALUE: '["alpha","bravo","charlie"]',
      TEST_EMPTY_VALUE: '',
      TEST_OBJECT_VALUE: '{"alpha":"a","bravo":{"charlie":"c","delta":"d"},"echo":"e"}',
      TEST_EXTERNAL_STRING: 'ExternalString',
      TEST_EXTERNAL_OBJECT: '{"alpha":"a"}',
    };
    const method = (name, get) => {
      assert.strictEqual(name, 'getConfig');
      _.each(expected, (value, key) => {
        assert.strictEqual(get(key), value);
      });
      done();
    };
    const env = fs.readFileSync(ENV_PATH, { encoding: 'utf8' });
    assert.strictEqual(typeof env, 'string');
    hapiConf({ method }, /^test_/i, { env });
  });

  it('should load an external environment as a buffer', (done) => {
    const expected = {
      TEST_STRING_VALUE: 'TestString',
      TEST_NUMBER_VALUE: '123.45',
      TEST_INTEGER_VALUE: '123',
      TEST_ARRAY_VALUE: '["alpha","bravo","charlie"]',
      TEST_EMPTY_VALUE: '',
      TEST_OBJECT_VALUE: '{"alpha":"a","bravo":{"charlie":"c","delta":"d"},"echo":"e"}',
      TEST_EXTERNAL_STRING: 'ExternalString',
      TEST_EXTERNAL_OBJECT: '{"alpha":"a"}',
    };
    const method = (name, get) => {
      assert.strictEqual(name, 'getConfig');
      _.each(expected, (value, key) => {
        assert.strictEqual(get(key), value);
      });
      done();
    };
    const env = fs.readFileSync(ENV_PATH);
    assert.strictEqual(Buffer.isBuffer(env), true);
    hapiConf({ method }, /^test_/i, { env });
  });

  it('should ignore empty external environment definitions', (done) => {
    const expected = {
      TEST_STRING_VALUE: 'TestString',
      TEST_NUMBER_VALUE: '123.45',
      TEST_INTEGER_VALUE: '123',
      TEST_ARRAY_VALUE: '["alpha","bravo","charlie"]',
      TEST_EMPTY_VALUE: '',
      TEST_OBJECT_VALUE: '{"alpha":"a","bravo":{"charlie":"c","delta":"d"},"echo":"e"}',
    };
    const method = (name, get) => {
      assert.strictEqual(name, 'getConfig');
      _.each(expected, (value, key) => {
        assert.strictEqual(get(key), value);
      });
      done();
    };
    hapiConf({ method }, /^test_/i, { env: '' });
  });

  it('should extend the environment if frozen option is set', (done) => {
    const expected = {
      TEST_STRING_VALUE: 'TestString',
      TEST_NUMBER_VALUE: 123.45,
      TEST_INTEGER_VALUE: 123,
      TEST_ARRAY_VALUE: ['alpha', 'bravo', 'charlie'],
      TEST_OBJECT_VALUE: {
        alpha: 'a',
        bravo: {
          charlie: 'c',
          delta: 'd',
        },
        echo: 'e',
      },
      TEST_EXTERNAL_STRING: 'ExternalString',
      TEST_EXTERNAL_OBJECT: {
        alpha: 'a',
      },
    };
    const method = (name, get) => {
      assert.strictEqual(name, 'getConfig');
      _.each(expected, (value, key) => {
        const val = get(key);
        if (key === 'TEST_OBJECT_VALUE' || key === 'TEST_EXTERNAL_OBJECT') {
          assert.deepEqual(val, value);
          assert.strictEqual(Object.isFrozen(val), true);
        } else if (key === 'TEST_ARRAY_VALUE') {
          assert.deepEqual(val, value);
        } else {
          assert.strictEqual(val, value);
        }
      });
      done();
    };
    const env = fs.readFileSync(ENV_PATH, { encoding: 'utf8' });
    assert.strictEqual(typeof env, 'string');
    hapiConf({ method }, /^test_/i, { freeze: true, json: true, env });
  });

  describe('.getConfig(key)', () => {
    it('should return the configuration value if defined', (done) => {
      const method = (name, get) => {
        assert.strictEqual(name, 'getConfig');
        assert.strictEqual(get('stringValue'), 'TestString');
        done();
      };
      const pattern = /^test_/i;
      const format = (key) => _.camelCase(key.replace(pattern, ''));
      hapiConf({ method }, pattern, { format });
    });
    it('should return undefined if the configuration value if not defined', (done) => {
      const method = (name, get) => {
        assert.strictEqual(name, 'getConfig');
        assert.strictEqual(get('stringValue'), undefined);
        done();
      };
      hapiConf({ method }, /^test_/i);
    });
    it('should return undefined if the key is not a string', (done) => {
      const method = (name, get) => {
        assert.strictEqual(name, 'getConfig');
        const keys = [true, false, '', 123, new Date(), {}, [], null, undefined, /test/i, NOOP];
        keys.forEach((key) => {
          assert.strictEqual(get(key), undefined);
        });
        done();
      };
      hapiConf({ method }, /^test_/i);
    });
  });
});
