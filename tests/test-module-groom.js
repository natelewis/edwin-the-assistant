var vows = require('vows');
var assert = require('assert');
var Groom = require('../lib/groom');

vows.describe('groom').addBatch({
    'a messagePayload with "Tell Nate dinner is ready"': {
        topic: new Groom('Tell Nate dinner is ready'),
        'Gives reply "Dinner is ready"': function (groom) {
            assert.equal(groom.messagePayload(), 'Dinner is ready');
        }
    },
    'a messagePayload with "Let Nate know dinner is ready"': {
        topic: new Groom('Let Nate know dinner is ready'),
        'Gives reply "Dinner is ready"': function (groom) {
            assert.equal(groom.messagePayload(), 'Dinner is ready');
        }
    },
    'a messagePayload with "Tell him He\'s awesome"': {
        topic: new Groom('Tell him He\'s awesome'),
        'Gives reply "You\'re awesome"': function (groom) {
            assert.equal(groom.messagePayload(), 'You\'re awesome');
        }
    }
}).export(module);
