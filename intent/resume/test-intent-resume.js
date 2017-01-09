var test = require('../../lib/test');
var vows = require('vows');

vows.describe('resume intent'
).addBatch(
    test.assertStatement({
        flow: [
            'resume music'
        ],
        action: 'resume',
        context: 'music',
        debug: false
    })
).export(module);
