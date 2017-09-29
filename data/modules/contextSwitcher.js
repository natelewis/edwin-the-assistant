const Intent = require('./../../lib/intent');
const log = require('./../../lib/logger');

module.exports = {
  run: function(dialog, config, callback, debug) {
    debug && console.log('contextSwitcherModule: ' + dialog.state.statement);

    let testState = {};
    testState.action = dialog.state.contextSwitcher;
    if (dialog.state.contextSwitcherRetry !== undefined) {
      testState.action = dialog.state.contextSwitcherRetry;
    }

    // update the context & topic based on intent
    const intent = new Intent(testState.action);

    testState = intent.updateContextAndTopic(testState);

    if (testState.topic !== undefined) {
      log.info('contextSwitch:  New Toipc from switcher!');
      dialog.state.query = undefined;
      dialog.state.reply = undefined;
      dialog.state.exit = true;
      dialog.state.context = testState.action;
      dialog.state.topic = testState.topic;
      log.state(dialog.state);
    }

    dialog.state.contextSwitcherRetry = undefined;
    dialog.state.contextSwitcher = undefined;
  },
};
