var test = require('../../lib/test');
var vows = require('vows');

vows.describe('text'
).addBatch(
    test.assertStatement({
        flow: [
            'play music in the kitchen'
        ],
        context: 'music',
        action: 'play',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'play some music in the kitchen'
        ],
        context: 'music',
        action: 'play',
        debug: false
    })
).export(module);
