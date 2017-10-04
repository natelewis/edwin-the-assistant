const Intent = require('./../../lib/intent');
const log = require('./../../lib/logger');
const State = require('./../../lib/State');

module.exports = {
  run: function(dialog, config, callback, debug) {
    const sss = new State();

    debug && console.log('contextSwitcherModule: ' + sss.getStatement());

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
      sss.setReply(undefined);
      sss.setContext(testState.action);
      sss.setTopic(testState.topic);
      log.state(dialog.state);
    }

    dialog.state.contextSwitcherRetry = undefined;
    dialog.state.contextSwitcher = undefined;
  },
};
