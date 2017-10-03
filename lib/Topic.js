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

   Topic object class

 */

const path = require('path');
const fs = require('fs');
const jsonfile = require('jsonfile');

/**
 * Topic class
 */
class Topic {
  /**
   * create a topic object
   * @param  {string} topicId [description]
   */
  constructor(topicId) {
    this.topicId = topicId;
    this.topicFile = path.join(
      __dirname,
      '..',
      'data',
      'topics',
      this.topicId + '.json'
    );
  }

  /**
   * Check if a topic exists
   * @return {Boolean} Topic exists
   */
  exists() {
    return fs.existsSync(this.topicFile);
  }

  /**
   * Return topic steps
   * @return {Array} Array of steps
   */
  steps() {
    if (this.exists) {
      return jsonfile.readFileSync(this.topicFile).steps;
    }
    return {};
  }
}

module.exports = Topic;
