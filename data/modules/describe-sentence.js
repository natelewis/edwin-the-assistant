module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    const Statement = require('./../../lib/statement');
    const debug = false;
    debug && console.log('describe-sentence: ' + state.getStatement());

    // we need this to continue
    if (state.getField('payload') === undefined) {
      return resolve(state);
    }

    let confirmation = 'Sure thing!';
    let numberOfWords = state.getField('payload').split(' ').length;

    // process the statement
    let statement = new Statement(state.getField('payload'), false);

    // get the action
    let actionStatement = 'The actionable intent word is '
      + statement.intent + '.\n';
    if (typeof (statement.intent) === 'undefined') {
      actionStatement = 'The sentence has no actionable intent.\n';
    }

    // get the context
    let contextStatement = 'The action has the implied context of '
      + statement.context + '.\n';
    if (typeof (statement.context) === 'undefined') {
      contextStatement = 'The sentence has no implied context.\n';
    }

    // break down each word in the sentence
    let wordTypes = '';
    for (let i = 0; i < statement.wordsLC.length; i++) {
      if (statement.wordsLC[i] === '\'') {
        wordTypes += 'Then an apostrophe.\n';
      } else if (statement.wordsLC[i].length === 1) {
        wordTypes += 'Then the letter "' + statement.wordsLC[i] + '".\n';
      } else {
        wordTypes += 'The word "' + statement.wordsLC[i];
        wordTypes += '" is a ' + statement.wordTypeNames[i] + '.\n';
      }
    }

    state.setFinal(
      confirmation + ' There is ' +
      numberOfWords + ' words in the sentence.\n' +
      actionStatement + contextStatement + wordTypes
    );
    return resolve(state);
  });
}};
