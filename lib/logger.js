/* Edwin The Assistant

   Copyright 2017 Nate Lewis

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   dstributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   Log formatter and dumper

 */

'use strict';

const chalk = require('chalk');
const timestamp = require('time-stamp');
const Statement = require('./Statement');

const Logger = (() => {
  const out = function(line) {
    console.log(line);
  };

  const showTime = () => {
    return '['+chalk.grey(timestamp('HH:mm:ss'))+']';
  };

  const info = function(obj) {
    process.stdout.write(showTime() + ' ');
    out(obj);
  };

  const statement = function(statement) {
    process.stdout.write(showTime() + ' STATEMENT: ' + statement + '\n    ');
    out(new Statement(statement).tagged);
  };

  const state = function(state) {
    // make a copy
    const stateCopy = Object.assign({}, state);
    // remove the response because it is too much noise
    delete stateCopy.responseObj;
    // send the log out to console
    process.stdout.write(showTime() + ' STATE:\n');
    out(stateCopy);
  };

  const step = function(step) {
    // make a copy
    const stepCopy = Object.assign({}, step);
    // send the log out to console
    process.stdout.write(showTime() + ' STEP:\n');
    out(stepCopy);
  };

  return {
    out: out,
    info: info,
    statement: statement,
    state: state,
    step: step,
  };
})();

module.exports = Logger;
