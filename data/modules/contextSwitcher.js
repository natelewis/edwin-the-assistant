const Intent = require('./../../lib/intent');
const log = require('./../../lib/logger');
const State = require('./../../lib/State');

module.exports = {
  run: function(dialog, config, callback, debug) {
    const sss = new State();

    // incomming action from switcher question
    const action = sss.getField(sss.getQuery());

    // update the context & topic based on intent
    const intent = new Intent(action);

    // if intent is a real thing lets see if we can switch top it
    if (intent.isValid()) {
      // get new topic based on intent
      const newTopic = intent.updateTopicFromModifiers({
        statement: sss.getStatement(),
        context: sss.getContext(),
        topic: undefined,
      });

      console.log('TEST TPOIC:' + newTopic);
      if (newTopic !== undefined) {
        log.info('contextSwitch:  New Topic from switcher!');
        sss.setReply(undefined);
        sss.setContext(action);
        sss.setTopic(newTopic);
        log.state(dialog.state);
      }
    }
  },
};
