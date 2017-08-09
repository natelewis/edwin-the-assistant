const path = require('path');
const fs = require('fs');
const Intent = require('../lib/intent');

module.exports = {
  run: function(state, config, callback, debug) {
    debug && console.log('contextSwitcherModule: ' + state.statement);

    let intentJSONFile = path.join(__dirname, '..', 'intent', state.action + '.json');

    // check if json version is present
    if (fs.existsSync(intentJSONFile)) {
      // deep clone state using JSON parse
      let testState = {};
      testState.context = state.contextSwitcher;
      if (typeof (state.contextSwitcherRetry) !== 'undefined') {
        testState.context = state.contextSwitcherRetry;
      }

      // update the context & conversation based on intent
      const intent = new Intent(testState.action);
      testState.context = intent.updateContext(testState.context, testState.statement);
      testState.conversation = intent.updateConversation(testState.context);

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
  },
};
