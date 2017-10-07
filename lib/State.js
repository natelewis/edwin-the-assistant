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

// in memory session storage
let stateStorage = {};


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
      instance.fields = {};
    } else {
      // log.state(instance);
    }

    return instance;
  }

  /**
   * Get the action of the conversation
   */
  reset() {
    // all the things we set
    this.action = undefined;
    this.topic = undefined;
    this.reply = undefined;
    this.replyTo = undefined;
    this.statement = undefined;
    this.context = undefined;
    this.final = undefined;
    this.query = undefined;
    this.initialContext = undefined;
    this.fields = {};
  }

  /**
   * Save the current session to stateStorage
   */
  save() {
    // save a copy of the object to stateStorage
    stateStorage[this.getSessionId()] = Object.assign({}, this);
  }

  /**
   * Load the initial session data if it exists
   * @param  {string} sessionId The sesssion Id
   */
  load(sessionId) {
    // this sessions data
    const s = stateStorage[sessionId];

    // reset it to a known state
    this.reset();

    // set the session id in case its blank, so if it has never been a session
    // that will be the only data
    this.sessionId = sessionId;

    // copy the stuff here we care about
    // and undef the things we want undefed from a fresh load
    if (s !== undefined) {
      this.fields = s.fields;
      this.query = s.query;
      this.initialContext = s.initialContext;
      this.action = s.action;
      this.topic = s.topic;
      this.replyTo = s.replyTo;
      this.context = s.context;
      this.query = s.query;
      this.reply = undefined;
      this.final = undefined;
    }

    // it is now a thing, save it we now know about it in the future
    this.save();
  }

  /**
   * Get the current statement
   * @return {string} Returns the current statement
   */
  getStatement() {
    return this.statement;
  }

  /**
   * Set the current statement
   * @param {string} value Value of current statement
   * @return {string} Returns the current statement
   */
  setStatement(value) {
    this.statement = value;
    this.save();
    return this.statement;
  }

  /**
   * Get the replyTo of the conversation
   * @return {string} Returns the replyTo of the converstaion
   */
  getReplyTo() {
    return this.replyTo;
  }

  /**
   * Set the replyTo of the conversation
   * @param {string} value Value to set the replyTo to
   * @return {string} Returns the replyTo
   */
  setReplyTo(value) {
    this.replyTo = value;
    this.save();
    return this.replyTo;
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
    this.save();
    return this.action;
  }

  /**
   * Get the current query field
   * @return {string} Returns the query field name
   */
  getQuery() {
    return this.query;
  }

  /**
   * Set the query field we are asking for next
   * @param {string} value Field name for the query
   * @return {string} Returns the field name
   */
  setQuery(value) {
    this.query = value;
    this.save();
    return this.query;
  }

  /**
   * Get a field of the conversation
   * @param {string} fieldName Field name to set
   * @return {string} Returns the field value
   */
  getField(fieldName) {
    return this.fields[fieldName];
  }

  /**
   * Set a field of the conversation
   * @param {string} fieldName Field name to set
   * @param {string} value Value to set the field to
   */
  setField(fieldName, value) {
    this.fields[fieldName] = value;
    this.save();
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
    this.save();
  }

  /**
   * Get the session id
   * @return {string} session id
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Set the session id
   * @param {string} value Value to session id
   */
  setSessionId(value) {
    this.sessionId = value;
    this.save();
  }

  /**
   * Get the context of the conversation
   * @return {string} Returns the context of the converstaion
   */
  getContext() {
    return this.context;
  }

  /**
   * Set the context of the conversation
   * @param {string} value Value to set the context to
   * @return {string} Returns the context
   */
  setContext(value) {
    if (this.fields.initialContext === undefined) {
      this.fields.initialContext = value;
    }
    this.context = value;
    this.save();
    return this.context;
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
    this.save();
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
    this.save();
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
    this.save();
    return this.reply;
  }
}

module.exports = State;
