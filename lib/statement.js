/*  Edwin The Assistant

   Copyright 2017 Nate Lewis

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   Statement processor for actions and context

 */

'use strict';

const Words = require('./words');
const pos = require('pos');
const lexer = new pos.Lexer();
const tagger = new pos.Tagger();

/**
 * [Statement description]
 * @param       {[type]} text  [description]
 * @param       {[type]} debug [description]
 * @constructor
 */
function Statement(text, debug) {
  // in case its called on something thats not
  if (typeof(text) === 'undefined') {
    text = '';
  }

  this.wordsLC = lexer.lex(text.toLowerCase());
  this.wordsTypes = lexer.lex(text.toLowerCase());
  this.tagged = tagger.tag(lexer.lex(text));

  let words = new Words(text);
  this.wordTypeNames = words.wordTypeNames;
  this.wordTypes = words.wordTypes;

  this.text = text;
  this.debug = debug;

  // process the statement
  this._processStatement();
};

// replace anything in the statement with replacement notation
// example "you want to talk to [contact]?"
// would be "you want to talk to " + state.contact + "?"
Statement.prototype.replaceFields = function(fields) {
  let swapVarRegex = new RegExp(/\[(.*?)]/g);
  let result;
  let replacedReply = this.text;
  while ((result = swapVarRegex.exec(this.text)) !== null) {
    // make sure we are not passin the word undefined in

    replacedReply = replacedReply.replace(
      result[0],
      (fields[result[1]] === undefined) ? '' : fields[result[1]]
    );
  }
  return replacedReply;
};


// get the logical action and its context of the statement
Statement.prototype._processStatement = function() {

  this.debug && console.log('statement: Processing statement: ' + this.text);

  // array of words in lower case
  let wlc = this.wordsLC;
  let words = new Words(this.text);

  if (wlc.length < 2) {
    // its only one word
    this.context = wlc[0];
    this.intent = wlc[0];
    this.debug && console.log('statement: action match "' + this.intent + '" - one word statement with the context of ' + this.context);
    return this.intent;
  }

  if (wlc.length > 2 && (wlc[0] === 'can' || wlc[0] === 'will')) {
    // starts with will/can
    this.context = words.getNextWordOfTypeAfterWord(wlc[2], 'NNP', this.debug);
    this.intent = wlc[2];
    this.debug && console.log('statement: action match "' + this.intent + '" - starts with can/will with the context of ' + this.context);
    return this.intent;
  }

  if (this.wordTypes[0] === 'VB') {
    // first word is a verb
    this.context = words.getNextWordOfTypeAfterWord(wlc[0], 'NN', this.debug);
    // try NN if NNP doesn't work
    if (typeof (this.context) === 'undefined') {
      this.context = words.getNextWordOfTypeAfterWord(wlc[0], 'NNP', this.debug);
    }
    this.intent = wlc[0];
    this.debug && console.log('statement: action match "' + this.intent + '" - first word in sentence is a verb with the context of ' + this.context);
    return this.intent;
  }

  if (wlc.length > 2 && (this.wordTypes[0] === 'NN' && this.wordTypes[1].match(/DT/))) {
    // first word is noun followed by another noun
    this.context = wlc[2];
    this.intent = wlc[0];
    this.debug && console.log('statement: action match "' + this.intent + '" - starts with noun followed by DT with context of ' + this.context);
    return this.intent;
  }

  if (wlc.length > 1 && (this.wordTypes[0] === 'NN' && this.wordTypes[1].match(/NN/))) {
    // first word is noun followed by another noun
    this.context = wlc[1];
    this.intent = wlc[0];
    this.debug && console.log('statement: action match "' + this.intent + '" - starts with noun followed by NNP with context of ' + this.context);
    return this.intent;
  }

  if (wlc.length > 2 && (this.wordTypes[0] === 'NN' && this.wordTypes[1] === 'TO')) {
    // first word is noun followed by TO
    this.context = wlc[2];
    this.intent = wlc[0];
    this.debug && console.log('statement: action match "' + this.intent + '" - starts with noun followed by TO with context of ' + this.context);
    return this.intent;
  }

  if (words.getWordsByType(this.tagged, 'W').length > 0) {
    // First action
    this.intent = words.getWordsByType(this.tagged, 'W')[0];
    this.debug && console.log('statement: action match "' + this.intent + '" - first action');
    return this.intent;
  }

  if (words.getWordsByType(this.tagged, 'VB', true).length > 0) {
    // first verb
    let action = words.getWordsByType(this.tagged, 'VB', true)[0];

    // plase is a verb, lets not use it though
    if (action.toLowerCase() !== 'please') {
      this.intent = words.getWordsByType(this.tagged, 'VB', true)[0];
      this.debug && console.log('statement: action match "' + this.intent + '" - first verb');
      return this.intent;
    }
  }

  if (words.getWordsByType(this.tagged, 'NN').length > 0 && words.getWordsByType(this.tagged, 'IN').length > 0) {
    // Prop & noun
    this.intent = words.getWordsByType(this.tagged, 'NN')[0];
    this.debug && console.log('statement: action match "' + this.intent + '" - proposition & noun, noun action');
    return this.intent;
  }

  if (words.getWordsByType(this.tagged, 'JJ').length > 0) {
    // adjective?
    this.intent = words.getWordsByType(this.tagged, 'JJ')[0];
    // try NN for context
    this.context = words.getNextWordOfTypeAfterWord(this.intent, 'NN', this.debug);
    // try NN if NNP doesn't work
    if (typeof (this.context) === 'undefined') {
      this.context = words.getNextWordOfTypeAfterWord(this.intent, 'NNP', this.debug);
    }
    this.debug && console.log('statement: action match "' + this.intent + '" with the context of ' + this.context);
    return this.intent;
  }

  return this.intent;
};

module.exports = Statement;
