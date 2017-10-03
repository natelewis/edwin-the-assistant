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

   State singleton class

 */

'use strict';

const log = require('./logger');

// Block level variable to store class state
let instance = null;

/**
 * State singleton class
 */
class State {
  /**
   * State constructor
   */
  constructor() {
    if (!instance) {
      instance = this;

      // all the things we hold
      this.action = undefined;
      this.topic = undefined;
      this.reply = undefined;
      this.final = undefined;
      this.sessionId = undefined;
    } else {
      // log.state(instance);
    }
    return instance;
  }

  /**
   * Get the action of the conversation
   * @return {string} Returns the action of the converstaion
   */
  getAction() {
    return this.action;
  }

  /**
   * Set the action of the conversation
   * @param {string} value Value to set the action to
   * @return {string} Returns the action
   */
  setAction(value) {
    this.action = value;
    return this.action;
  }

  /**
   * Get the response object for client callbacks
   * @return {object} response object
   */
  getResponseObject() {
    return this.responseObj;
  }

  /**
   * Set the response object for client callbacks
   * @param {object} value Value to set the topic to
   */
  setResponseObject(value) {
    this.responseObj = value;
  }

  /**
   * Get the session id
   * @return {string} session id
   */
  getSessionId() {
    return this.session;
  }

  /**
   * Set the session id
   * @param {string} value Value to session id
   */
  setSessionId(value) {
    this.session = value;
  }

  /**
   * Get the action of the conversation
   * @return {string} Returns the action of the converstaion
   */
  getTopic() {
    return this.topic;
  }

  /**
   * Set the topic of the conversation
   * @param {string} value Value to set the topic to
   * @return {string} Returns the topic
   */
  setTopic(value) {
    this.topic = value;
    return this.topic;
  }

  /**
   * Set the final reply, and update the state to ensure no other reply is
   * present
   * @param {string} final The reply that is set to final
   * @return {string} Return the final
   */
  setFinal(final) {
    this.final = final;
    this.reply = undefined;
    return this.final;
  }

  /**
   * Get final reply
   * @return {string} Final reply
   */
  getFinal() {
    return this.final;
  }

  /**
   * Get non final reply
   * @return {string} Non final reply
   */
  getReply() {
    return this.reply;
  }

  /**
   * Set the reply and expect a response
   * @param {string} reply Response to user from Edwin
   */
  setReply(reply) {
    this.reply = reply;
    this.final = undefined;
    return this.reply;
  }
}

module.exports = State;
