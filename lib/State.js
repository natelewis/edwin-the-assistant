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
   * @return {string} Returns the action of the converstaion
   */
  reset() {
    // all the things we set
    this.action = undefined;
    this.topic = undefined;
    this.reply = undefined;
    this.statement = undefined;
    this.context = undefined;
    this.final = undefined;
    this.query = undefined;
    this.sessionId = undefined;
    this.intialStatment = undefined;
    this.fields = {};
  }

  /**
   * [save description]
   * @return {[type]} [description]
   */
  save() {
    console.log("SAVING STATE: ");
    log.state(this);
    stateStorage[this.getSessionId()] = this;
  }

  /**
   * [load description]
   * @return {[type]} [description]
   */
  load() {
    const newState = Object.assign(this, stateStorage[this.getSessionId()]);
    console.log("LOADED STATE:");
    log.state(newState);
    return newState;
  }

  /**
   * Get the current statement
   * @return {string} Returns the current statement
   */
  getInitialStatement() {
    return this.intialStatment;
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
    // set the intial if this is the first time we are setting it
    if (this.getInitialStatement === undefined) {
      this.intialStatment = value;
    }
    this.statement = value;
    return this.statement;
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
    console.log('SET FIELD: ' + fieldName + ' = ' + value);
    this.fields[fieldName] = value;
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
    return this.sessionId;
  }

  /**
   * Set the session id
   * @param {string} value Value to session id
   */
  setSessionId(value) {
    this.sessionId = value;
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
    this.context = value;
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