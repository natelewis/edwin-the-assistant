var test = require('../../lib/test');
var vows = require('vows');

vows.describe('text'
).addBatch(
    test.assertStatement({
        flow: [
            'stop the music'
        ],
        context: 'music',
        action: 'stop',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'stop playin this song'
        ],
        context: 'song',
        action: 'stop',
        debug: false
    })
).export(module);
