const path = require('path');
const fs = require('fs');
const Intent = require('../lib/intent');

module.exports = {
  run: function(dialog, config, callback, debug) {
    debug && console.log('contextSwitcherModule: ' + dialog.state.statement);

    let intentJSONFile = path.join(
      __dirname,
      '..',
      'intent',
      dialog.state.action + '.json'
    );

    // check if json version is present
    if (fs.existsSync(intentJSONFile)) {
      // deep clone state using JSON parse
      let testState = {};
      testState.context = dialog.state.contextSwitcher;
      if (typeof (dialog.state.contextSwitcherRetry) !== 'undefined') {
        testState.context = dialog.state.contextSwitcherRetry;
      }

      // update the context & conversation based on intent
      const intent = new Intent(testState.action);
      testState.context = intent.updateContext(
        testState.context,
        testState.statement
      );
      testState.conversation = intent.updateConversation(testState.context);

      console.log(testState);
      if (typeof (testState.conversation) !== 'undefined') {
        dialog.state.query = undefined;
        dialog.state.reply = undefined;
        dialog.state.exit = true;
        dialog.state.context = testState.context;
        dialog.state.conversation = testState.conversation;
      }
    }

    console.log('leaving contextswitch');
    console.log(dialog.state);
    dialog.state.contextSwitcherRetry = undefined;
    return dialog.state;
  },
};
