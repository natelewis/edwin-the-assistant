const Statement = require('./../../lib/statement');

module.exports = {
  run: function(dialog, config, callback, debug) {
    debug && console.log('describe-sentence: ' + dialog.state.sentence);

    // we need this to continue
    if (dialog.state.payload === undefined) {
      return;
    }

    let confirmation = 'Sure thing!';
    let numberOfWords = dialog.state.payload.split(' ').length;

    // process the statement
    let statement = new Statement(dialog.state.payload, false);

    // get the action
    let actionStatement = 'The actionable intent word is ' + statement.action + '.\n';
    if (typeof (statement.action) === 'undefined') {
      actionStatement = 'The sentence has no actionable intent.\n';
    }

    debug && console.log('describe-sentence: actionStatement (' + actionStatement + ')');

    // get the context
    let contextStatement = 'The action has the implied context of ' + statement.context + '.\n';
    if (typeof (statement.context) === 'undefined') {
      contextStatement = 'The sentence has no implied context.\n';
    }

    debug && console.log('describe-sentence: contextStatement (' + actionStatement + ')');

    // break down each word in the sentence
    let wordTypes = '';
    for (let i = 0; i < statement.wordsLC.length; i++) {
      if (statement.wordsLC[i] === '\'') {
        wordTypes += 'Then an apostrophe.\n';
      } else if (statement.wordsLC[i].length === 1) {
        wordTypes += 'Then the letter "' + statement.wordsLC[i] + '".\n';
      } else {
        wordTypes += 'The word "' + statement.wordsLC[i] + '" is a ' + statement.wordTypeNames[i] + '.\n';
      }
    }

    dialog.setFinal(confirmation + ' There is ' + numberOfWords + ' words in the sentence.\n' + actionStatement + contextStatement + wordTypes);
    dialog.finish();
  },
};
