/* Edwin The Assistant

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

   Word processing lexers and tagging

 */

'use strict';

const pos = require('pos');
const lexer = new pos.Lexer();
const tagger = new pos.Tagger();

/**
 * [Words description]
 * @param       {[type]} text [description]
 * @constructor
 */
function Words(text) {
  if ( text === undefined) {
    text = '';
  }
  this.text = text;
  this.debug = false;
  this.words = lexer.lex(text);
  this.wordsLC = lexer.lex(text.toLowerCase());
  this.tagged = tagger.tag(this.words);
  this.wordTypeNames = [];
  this.wordTypes = [];
  for (let i = 0; i < this.wordsLC.length; i++) {
    this.wordTypeNames.push(this.getWordTypeName(this.wordsLC[i]));
    this.wordTypes.push(this.getWordType(this.wordsLC[i]));
  }
}

// Get everything before the first instance of a word
Words.prototype.getEverythingBeforeWord = function(startWord) {
  // one before the start index
  let startIndex = this.wordsLC.indexOf(startWord.toLowerCase()) - 1;

  // all the words joined form the words we have
  let allTheWords = this.words.slice(0, startIndex).join(' ');

  // if nothing is there give undef
  if (allTheWords === '') {
    return undefined;
  }

  // squeeze tics
  allTheWords = allTheWords.replace(/ ' /, '\'');

  return allTheWords;
};

// Get everything after the first instance of a word
Words.prototype.getEverythingAfterWord = function(startWord) {
  // bail if we didn't get a start word
  if (typeof (startWord) === 'undefined') {
    return undefined;
  }

  // one after the start index
  let startIndex = this.wordsLC.indexOf(startWord.toLowerCase()) + 1;

  // pull the words
  let allTheWords = this.words.slice(startIndex, this.words.length).join(' ');

  // if nothing is there give undef
  if (allTheWords === '') {
    return undefined;
  }

  // squeze tics
  allTheWords = allTheWords.replace(/ ' /, '\'');

  return allTheWords;
};

// get the word type from the lexer
Words.prototype.getWordType = function(singleWord) {
  if (singleWord) {
    return tagger.tag(lexer.lex(singleWord))[0][1];
  } else {
    return undefined;
  }
};

// respond with what type of word a type is
Words.prototype.getWordTypeName = function(singleWord) {
  if (singleWord) {
    let tag = tagger.tag(lexer.lex(singleWord))[0][1];

    if (tag === 'CC') {
      return 'coord conjunction';
    }

    if (tag === 'CD') {
      return 'cardinal number';
    }

    if (tag === 'DT') {
      return 'determiner';
    }

    if (tag === 'EX') {
      return 'existential there';
    }

    if (tag === 'FW') {
      return 'foreign Word';
    }

    if (tag === 'IN') {
      return 'preposition';
    }

    if (tag === 'JJ') {
      return 'adjective';
    }

    if (tag === 'JJR') {
      return 'comparative adjective';
    }

    if (tag === 'JJS') {
      return 'superlative adjective';
    }

    if (tag === 'LS') {
      return 'list item marker';
    }

    if (tag === 'MD') {
      return 'modal';
    }

    if (tag === 'NN') {
      return 'singular or mass noun';
    }

    if (tag === 'NNP') {
      return 'singular proper noun';
    }

    if (tag === 'NNPS') {
      return 'plural proper noun';
    }

    if (tag === 'NNPS') {
      return 'plural proper noun';
    }

    if (tag === 'NNS') {
      return 'plural noun';
    }

    if (tag === 'POS') {
      return 'possessive ending';
    }

    if (tag === 'PDT') {
      return 'predeterminer';
    }

    if (tag === 'PP$') {
      return 'possesive pronoun';
    }

    if (tag === 'PRP') {
      return 'personal pronoun';
    }

    if (tag === 'RB') {
      return 'adverb';
    }

    if (tag === 'RBR') {
      return 'comparative adverb';
    }

    if (tag === 'RP') {
      return 'particle';
    }

    if (tag === 'SYM') {
      return 'symbol';
    }

    if (tag === 'TO') {
      return 'to';
    }

    if (tag === 'UH') {
      return 'interjection';
    }

    if (tag === 'VB') {
      return 'base form verb';
    }

    if (tag === 'VBD') {
      return 'past tense verb';
    }

    if (tag === 'VBG') {
      return 'gerund verb';
    }

    if (tag === 'VBN') {
      return 'past part verb';
    }

    if (tag === 'VBP') {
      return 'prestent verb';
    }

    if (tag === 'VBZ') {
      return 'plural prestent verb';
    }

    if (tag === 'VBZ') {
      return 'plural prestent verb';
    }

    if (tag === 'WDT') {
      return 'W H determiner';
    }

    if (tag === 'WP') {
      return 'W H pronoun';
    }

    if (tag === 'WP$') {
      return 'possessive W H';
    }

    if (tag === 'WrB') {
      return 'W H adverb';
    }

    return tagger.tag(lexer.lex(singleWord))[0][1];
  } else {
    return undefined;
  }
};

// Get the next work of a type after another word
Words.prototype.getNextWordOfTypeAfterWord = function(startWord, nextType) {
  let startIndex = this.wordsLC.indexOf(startWord.toLowerCase());
  let arrayLength = this.wordsLC.length;

  this.debug && console.log('getNextWordOfTypeAfterWord: from startWord of ' + startWord + ' looking a ' + nextType);

  for (var i = startIndex + 1; i < arrayLength; i++) {
    if (this.getWordType(this.words[i]) === nextType) {
      this.debug && console.log('getNextWordOfTypeAfterWord: found ' + this.wordsLC[i]);
      return this.wordsLC[i];
    }
  }

  this.debug && console.log('getNextWordOfTypeAfterWord: found ' + this.wordsLC[i]);

  return undefined;
};

// Get the words by type from the array
Words.prototype.getWordsByType = function(array, string, strict) {
  let type = array.filter(function(word) {
    if (strict) {
      return (word[1] === string);
    } else {
      return (word[1].slice(0, string.length) === string);
    }
  }).map(function(w) {
    return w[0];
  });

  return type;
};

module.exports = Words;
