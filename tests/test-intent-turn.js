var test = require('../lib/test');
var vows = require('vows');

vows.describe('generic intent'
).addBatch(
    test.assertStatement({
        flow: [
            'turn down music'
        ],
        action: 'turn',
        context: 'music',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'turn down the music in the sun room'
        ],
        action: 'turn',
        context: 'music',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'turn up music in the sun room'
        ],
        action: 'turn',
        context: 'music',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'turn the music down in the kitchen'
        ],
        action: 'turn',
        context: 'music',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'turn up the music in the kitchen'
        ],
        action: 'turn',
        context: 'music',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'turn the music back on'
        ],
        action: 'turn',
        context: 'music',
        debug: false
    })
).export(module);
