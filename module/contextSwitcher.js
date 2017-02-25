const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');
const IntentHandler = require('../lib/intentHandler');

module.exports = {
    run: function (state, config, callback, debug) {
        debug && console.log('contextSwitcherModule: ' + state.statement);

        var intentJSONFile = path.join(__dirname, '..', 'intent', state.action + '.json');

        // check if json version is present
        if (fs.existsSync(intentJSONFile)) {
            // deep clone state using JSON parse
            var testState = {};
            testState.context = state.contextSwitcher;
            if (typeof (state.contextSwitcherRetry) !== 'undefined') {
                testState.context = state.contextSwitcherRetry;
            }

            testState = new IntentHandler(testState, function () {}, jsonfile.readFileSync(intentJSONFile));

            console.log(testState);
            if (typeof (testState.conversation) !== 'undefined') {
                state.query = undefined;
                state.reply = undefined;
                state.exit = true;
                state.context = testState.context;
                state.conversation = testState.conversation;
            }
        }

        console.log('leaving contextswitch');
        console.log(state);
        state.contextSwitcherRetry = undefined;

        return state;
    }
};
