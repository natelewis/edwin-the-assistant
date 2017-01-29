var vows = require('vows');
var assert = require('assert');
var music = require('./index.js');

vows.describe('music').addBatch({
    'asking for zones': {
        topic: music.getZones(false),
        'Gives reply that is not undefined': function (zones) {
            zones.then(function (json) {
                assert.notEqual(json, undefined);
            });
        }
    }/*,
    'asking for rooms': {
        topic: sonos.getRooms(false),
        'Gives reply thats not undefined': function (zones) {
            zones.then(function (json) {
                assert.notEqual(json, undefined);
            });
        }
    } */
}).export(module);