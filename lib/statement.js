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

   Word Tags:
      CC Coord Conjuncn           and,but,or
      CD Cardinal number          one,two
      DT Determiner               the,some
      EX Existential there        there
      FW Foreign Word             mon dieu
      IN Preposition              of,in,by
      JJ Adjective                big
      JJR Adj., comparative       bigger
      JJS Adj., superlative       biggest
      LS List item marker         1,One
      MD Modal                    can,should
      NN Noun, sing. or mass      dog
      NNP Proper noun, sing.      Edinburgh
      NNPS Proper noun, plural    Smiths
      NNS Noun, plural            dogs
      POS Possessive ending       Õs
      PDT Predeterminer           all, both
      PP$ Possessive pronoun      my,oneÕs
      PRP Personal pronoun         I,you,she
      RB Adverb                   quickly
      RBR Adverb, comparative     faster
      RBS Adverb, superlative     fastest
      RP Particle                 up,off
      SYM Symbol                  +,%,&
      TO ÒtoÓ                     to
      UH Interjection             oh, oops
      VB verb, base form          eat
      VBD verb, past tense        ate
      VBG verb, gerund            eating
      VBN verb, past part         eaten
      VBP Verb, present           eat
      VBZ Verb, present           eats
      WDT Wh-determiner           which,that
      WP Wh pronoun               who,what
      WP$ Possessive-Wh           whose
      WRB Wh-adverb               how,where
      , Comma                     ,
      . Sent-final punct          . ! ?
      : Mid-sent punct.           : ; Ñ
      $ Dollar sign               $
      # Pound sign                #
      " quote                     "
      ( Left paren                (
      ) Right paren               )

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
class Statement {
  /**
   * [constructor description]
   * @param  {[type]} text  [description]
   * @param  {[type]} debug [description]
   */
  constructor(text, debug) {
    // in case its called on something thats not
    if (typeof(text) === 'undefined') {
      text = '';
    }

    this.wordsLC = lexer.lex(text.toLowerCase());
    this.wordsTypes = lexer.lex(text.toLowerCase());
    this.tagged = tagger.tag(lexer.lex(text));

    let words = new Words(text);
    this.words = words;
    this.wordTypeNames = words.wordTypeNames;
    this.wordTypes = words.wordTypes;

    this.text = text;
    this.debug = debug;

    // process the statement
    this._processStatement();
  }

  /**
   * replace anything in the statement with replacement notation
   * example "you want to talk to [contact]?"
   * would be "you want to talk to " + state.contact + "?"
   * @param  {[type]} fields [description]
   * @return {[type]}        [description]
   */
  replaceFields(fields) {
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
  }
  
  /**
   * Get the implied context from the statement
   * @return {string} context
   */
  impliedContext() {
    return this.context;
  }

  /**
   * Get the implied intent from the statement
   * @return {string} intent
   */
  impliedIntent() {
    return this.intent;
  }

  /**
   * A statement with only one word
   * @return {Boolean}
   */
  isOneWordStatement() {
    return this.wordsLC.length < 2;
  }

  /**
   * The statement starts with 'will' or 'can'
   * @return {Boolean}
   */
  startsWithCanOrWill() {
    return this.wordsLC.length > 2
      && (this.wordsLC[0] === 'can' || this.wordsLC[0] === 'will');
  }

  /**
   * First word is a verb
   * @return {Boolean}
   */
  fristWordIsAVerb() {
    return this.wordTypes[0] === 'VB';
  }

  /**
   * First word is a noun then a determiner (the usually)
   *
   * @return {Boolean}
   */
  firstWordIsANounThenDeterminer() {
    return this.wordsLC.length > 2
      && (this.wordTypes[0] === 'NN' && this.wordTypes[1].match(/DT/));
  }

  /**
   * First two words are nouns
   *
   * @return {Boolean}
   */
  firstTwoWordsAreNouns() {
    return this.wordsLC.length > 1
      && (this.wordTypes[0] === 'NN' && this.wordTypes[1].match(/NN/));
  }

  /**
   * First word is a noun then TO
   *
   * @return {Boolean}
   */
  firstWordIsANountThenTo() {
    return this.wordsLC.length > 12
      && (this.wordTypes[0] === 'NN' && this.wordTypes[1].match(/TO/));
  }

  /**
   * Statement has a verb
   *
   * @return {Boolean}
   */
  hasAVerb() {
    return this.words.getWordsByType(this.tagged, 'VB', true).length > 0;
  }

  /**
   * Statement has at least one proposition and noun
   *
   * @return {Boolean}
   */
  hasPropositionAndNoun() {
    return this.words.getWordsByType(this.tagged, 'NN').length > 0
      && this.words.getWordsByType(this.tagged, 'IN').length > 0;
  }


  /**
   * Statement has at least one proposition and noun
   *
   * @return {Boolean}
   */
  hasAnAdjective() {
    return this.words.getWordsByType(this.tagged, 'JJ').length > 0;
  }

  /**
   * debug messaging for intent matches
   * @param  {string} queryMatch What was matched to set intent
   * @param  {string} intent     What intent is set to
   *
   * @return {string} intent
   */
  logIntentDebug(queryMatch, intent) {
    this.debug && console.log('statement: '
      + '(' + queryMatch + ') ' + intent);
    return intent;
  }

  /**
   * debug messaging for context matches
   * @param  {string} queryMatch What was matched to set intent
   * @param  {string} context    What context is set to
   *
   * @return {string} context
   */
  logContextDebug(queryMatch, context) {
    this.debug && console.log('statement: '
      + '(' + queryMatch + ') ' + context);
    return context;
  }

  /**
   * [_processStatement description]
   * @return {[type]} [description]
   */
  _processStatement() {
    this.debug && console.log('statement: Processing statement: ' + this.text);

    // array of words in lower case
    let words = new Words(this.text);

    if (this.isOneWordStatement()) {
      // its only one word
      this.context = this.wordsLC[0];
      this.intent = this.wordsLC[0];
      this.logContextDebug('isOneWordStatement', this.context);
      return this.logIntentDebug('isOneWordStatement', this.intent);
    }

    if (this.startsWithCanOrWill()) {
      this.context = words.getNextWordOfTypeAfterWord(
        this.wordsLC[2],
        'NNP',
        this.debug
      );
      this.intent = this.wordsLC[2];
      return this.logIntentDebug('startsWithCanOrWill', this.intent);
    }

    if (this.fristWordIsAVerb()) {
      this.context = words.getNextWordOfTypeAfterWord(
        this.wordsLC[0],
        'NN',
        this.debug
      );

      // try NN if NNP doesn't work
      if (typeof (this.context) === 'undefined') {
        this.context = words.getNextWordOfTypeAfterWord(
          this.wordsLC[0],
          'NNP',
          this.debug
        );
      }
      this.logContextDebug('fristWordIsAVerb', this.context);

      this.intent = this.wordsLC[0];
      return this.logIntentDebug('fristWordIsAVerb', this.intent);
    }

    if (this.firstWordIsANounThenDeterminer()) {
      this.context = this.wordsLC[2];
      this.intent = this.wordsLC[0];
      this.logContextDebug('firstWordIsANounThenDeterminer', this.context);
      return this.logIntentDebug('firstWordIsANounThenDeterminer', this.intent);
    }

    if (this.firstTwoWordsAreNouns()) {
      this.context = this.wordsLC[1];
      this.intent = this.wordsLC[0];
      this.logContextDebug('firstTwoWordsAreNouns', this.context);
      return this.logIntentDebug('firstTwoWordsAreNouns', this.intent);
    }

    if (this.firstWordIsANountThenTo()) {
      // first word is noun followed by TO
      this.context = this.wordsLC[2];
      this.intent = this.wordsLC[0];
      this.logContextDebug('firstWordIsANountThenTo', this.context);
      return this.logIntentDebug('firstWordIsANountThenTo', this.intent);
    }

    if (this.hasAVerb()) {
      let firstVerb = words.getWordsByType(this.tagged, 'VB', true)[0];

      // please is a verb, lets not use it though
      if (firstVerb.toLowerCase() !== 'please') {
        this.intent = firstVerb;
        return this.logIntentDebug('hasAVerb', this.intent);
      }
    }

    if (this.hasPropositionAndNoun()) {
      this.intent = words.getWordsByType(this.tagged, 'NN')[0];
      return this.logIntentDebug('hasPropositionAndNoun', this.intent);
    }

    if (this.hasAnAdjective()) {
      this.intent = words.getWordsByType(this.tagged, 'JJ')[0];
      // try NN for context
      this.context = words.getNextWordOfTypeAfterWord(
        this.intent, 'NN',
        this.debug
      );
      // try NN if NNP doesn't work
      if (typeof (this.context) === 'undefined') {
        this.context = words.getNextWordOfTypeAfterWord(
          this.intent,
          'NNP',
          this.debug
        );
      }

      this.logContextDebug('hasAnAdjective', this.context);
      return this.logIntentDebug('hasAnAdjective', this.intent);
    }

    return this.logIntentDebug('No match', this.intent);
  }
}


module.exports = Statement;
