var test = require('../../lib/test');
var vows = require('vows');

vows.describe('send'
).addBatch(
    test.assertStatement({
        flow: [
            'Send text to Nate'
        ],
        action: 'text',
        context: 'nate',
        payload: undefined,
        debug: false
    })
).export(module);
