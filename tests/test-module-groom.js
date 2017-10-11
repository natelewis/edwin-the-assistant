'use strict';

/* TODO need rewrite for mocha

let vows = require('vows');
let assert = require('assert');
let Groom = require('../lib/Groom');

vows.describe('groom').addBatch({
  'a messagePayload with "Tell Nate dinner is ready"': {
    'topic': new Groom('Tell Nate dinner is ready'),
    'Gives reply "Dinner is ready"': function(groom) {
      assert.equal(groom.messagePayload(), 'Dinner is ready');
    },
  },
  'a messagePayload with "Let Nate know dinner is ready"': {
    'topic': new Groom('Let Nate know dinner is ready'),
    'Gives reply "Dinner is ready"': function(groom) {
      assert.equal(groom.messagePayload(), 'Dinner is ready');
    },
  },
  'a messagePayload with "Tell him He\'s awesome"': {
    'topic': new Groom('Tell him He\'s awesome'),
    'Gives reply "You\'re awesome"': function(groom) {
      assert.equal(groom.messagePayload(), 'You\'re awesome');
    },
  },
  'a confirmToTrue with "yes"': {
    'topic': new Groom('yep'),
    'Gives reply "true"': function(groom) {
      assert.equal(groom.confirmToTrue(), 'true');
    },
  },
  'a confirmToTrue with "yep"': {
    'topic': new Groom('yep'),
    'Gives reply "true"': function(groom) {
      assert.equal(groom.confirmToTrue(), 'true');
    },
  },
  'a confirmToTrue with "heck no"': {
    'topic': new Groom('heck no'),
    'Gives reply "false"': function(groom) {
      assert.equal(groom.confirmToTrue(), 'false');
    },
  },
}).export(module);

*/
