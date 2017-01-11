var test = require('../lib/test');
var vows = require('vows');

vows.describe('generic intent'
).addBatch(
    test.assertStatement({
        flow: [
            'pause song'
        ],
        action: 'pause',
        context: 'music',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'pause music'
        ],
        action: 'pause',
        context: 'music',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'pause the music'
        ],
        action: 'pause',
        context: 'music',
        debug: false
    })
).export(module);