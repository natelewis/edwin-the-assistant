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

   Standalone client using speaker and mic

 */

'use strict';

const Edwin = require('../edwin');
const appConfig = require('../config');

let standaloneState = {};

if (!appConfig.get('standalone.enabled')) {
  console.log('standalone: not enabled');
} else {
  const MicToSpeech = require('mic-to-speech');
  const say = require('say');
  const Speech = require('google-speech-from-buffer');

  // in a standard env this will pick up and watch the microphone
  const micToSpeech = new MicToSpeech();

  micToSpeech.on('speech', function(buffer) {
    // pause my speech so I don't listen to what I'm saying
    micToSpeech.pause();
    // process the speech with Google API and get a reply
    new Speech().recognize(buffer)
      .then(
        (statement) => {
          console.log('standalone: << ' + statement);
          new Edwin().converse(
            standaloneState,
            statement,
            standaloneRespondCallback
          );
        }
      );
  });

  const standaloneRespondCallback = function(state) {
    // If we are done set reply and clear state
    if (typeof (state.final) !== 'undefined') {
      state = {reply: state.final};
    }

    // set the state to persist
    standaloneState = state;

    if (state.reply !== undefined) {
      // spit it out and resume listening
      edwinSay(state.reply, function() {
        micToSpeech.resume();
      });
    } else {
      // nothing to say, resume listening
      micToSpeech.resume();
    }
  };

  const edwinSay = function(words, callback) {
    console.log('standalone: >> ' + words);
    say.speak(words, undefined, 1.0, function(err) {
      if (err) {
        return console.error(err);
      }
      callback();
    });
  };

  // Have Edwin start the conversation with an initial statement
  console.log('standalone: enabled');
  edwinSay('Edwin ready', function() {
    micToSpeech.start();
  });
}
