var test = require('../../../lib/test');
var vows = require('vows');

vows.describe('text'
).addBatch(
    test.assertStatement({
        flow: [
            'Can you text Nate I\'m on my way home',
            'yes'
        ],
        action: 'send',
        context: 'text',
        contact: 'nate',
        payload: 'I\'m on my way home',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'Send a text',
            'Nate',
            'Tell him I\'m on my way home',
            'yes'
        ],
        action: 'send',
        context: 'text',
        contact: 'nate',
        payload: 'I\'m on my way home',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'Send a text',
            'Nate',
            'I\'m on my way home',
            'yes'
        ],
        action: 'send',
        context: 'text',
        contact: 'nate',
        payload: 'I\'m on my way home',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'Text to Nate pick up milk on your way home',
            'yes'
        ],
        action: 'send',
        context: 'text',
        contact: 'nate',
        payload: 'pick up milk on your way home',
        debug: false
    })
).addBatch(
    test.assertStatement({
        flow: [
            'Send text to Nate pick up milk on your way home',
            'yes'
        ],
        action: 'send',
        context: 'text',
        contact: 'nate',
        payload: 'pick up milk on your way home',
        debug: false
    })
).export(module);
