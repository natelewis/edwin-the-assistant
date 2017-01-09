var test = require('../../lib/test');
var vows = require('vows');

vows.describe('email'
// prove it is not implemented
).addBatch(
    test.assertStatement({
        flow: [
            'Can you email Nate?'
        ],
        action: 'email',
        debug: false
    })
).export(module);
