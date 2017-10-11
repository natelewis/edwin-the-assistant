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

   Query word types and labels

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

const pos = require('pos');
const lexer = new pos.Lexer();
const tagger = new pos.Tagger();

/**
 * Query word types and labels
 * @class Words
 */
class Words {
  /**
   * @constructs Words
   * @param {string}  text The words about this text
   * @param {Boolean} debug
   *
   */
  constructor(text, debug) {
    this.text = text;
    if (text === undefined) {
      text = '';
    }
  }

  /**
   * Get the word type from the lexer
   * @param  {string} singleWord The word to query
   *
   * @return {string} The letter notation for the word type
   */
  getWordType(singleWord) {
    if (singleWord) {
      return tagger.tag(lexer.lex(singleWord))[0][1];
    } else {
      return undefined;
    }
  }

  /**
   * Respond with what type of word a type is
   * @param  {string} singleWord The word to query
   *
   * @return {string} The readable word for the word type
   */
  getWordTypeName(singleWord) {
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
        return 'present verb';
      }

      if (tag === 'VBZ') {
        return 'plural present verb';
      }

      if (tag === 'VBZ') {
        return 'plural present verb';
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
  }
}

module.exports = Words;
