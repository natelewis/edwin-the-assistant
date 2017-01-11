var test = require('../lib/test');
var vows = require('vows');

vows.describe('text'
).addBatch(
    test.assertStatement({
        flow: [
            'skip to the next song'
        ],
        context: 'music',
        action: 'skip',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'skip track in the kitchen'
        ],
        context: 'music',
        action: 'skip',
        debug: false
    })
).export(module);
