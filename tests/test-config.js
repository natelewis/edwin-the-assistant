'use strict';

const assert = require('assert');
const fs = require('fs');
const mute = require('mute');

before(() => {
  delete require.cache[require.resolve('../lib/config')];
});

after(() => {
  fs.unlinkSync('./TEST_CONFIG.json');
  delete require.cache[require.resolve('../lib/config')];
  process.env.EDWIN_CONFIG = undefined;
});

describe('Loading config', () => {
  it('should throw error on unloadable config', () => {
    process.env.EDWIN_CONFIG = '/../../notathing.json';
    assert.throws(() => {
      // because we will throw error, we won't actually unmute
      mute(process.stdout);
      require('../lib/config');
    }, Error);
  });

  it('should have the default port of 8080', () => {
    process.env.EDWIN_CONFIG = './TEST_CONFIG.json';
    const unmute = mute(process.stdout);
    const config = require('../lib/config');
    unmute();
    assert.equal(config.get('edwin.port'), '8080');
  });
});
