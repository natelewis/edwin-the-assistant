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

// Block level variable to store class state
let instance = null;

// in memory session storage
const stateStorage = {};
const sonosZones = [];

/**
 * State singleton class
 */
class State {
  /**
   * @constructs State
   */
  constructor() {
    if (!instance) {
      instance = this;
      instance.fields = {};
      instance.metadata = {};
      instance.metadata.topic = {};
    }

    return instance;
  }

  /**
   * Get the action of the conversation
   */
  reset() {
    // all the things we set
    this.intent = undefined;
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
      this.intent = s.intent;
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
   * Add a sonos zone
   * @param {Object} zone object {name:'bedroom', ip: '192.168.1.2'}
   */
  addSonosZone(zone) {
    // clean the zones,  remove it first if it is there in any way
    const newZones = [];
    for (let i = 0; i < sonosZones.length; i++) {
      if (sonosZones[i].ip !== zone.ip && sonosZones[i].name !== zone.name) {
        newZones.push(zone);
      }
    }
    // add new one to the end
    sonosZones.push(zone);
  }

  /**
   * Return the current sonos zone list
   * @return {array} Array of zone objects [{name:'bedroom', ip: '192.168.1.2'}]
   */
  getSonosZoneList() {
    return sonosZones;
  }

  /**
   * Session based data that does not reset after a conversation
   * @param {string} topicId The topic of the metadata or "bucket"
   * @param {field} field Field name
   * @param {value} value Value of the field
   *
   * TODO add expire for metadata to keep forever (even on restart) or if it's
   * data that looses its meaning after x amount of time it will fall off.
   * Currently only holding metadata in memory so it will last as long as the
   * server is up
   *
   * example:
   * "turn on the lights in the kitchen"
   * (hold lastRoomUsed: kitchen for 10 minutes)
   * "turn off lights" (lights module can look to see if lastRoomUsed is set and
   * if the lights in the kitchen are on, turn them off)
   *
   * even to the point of shared between modules
   * "play some classic rock" (sonos zone can check for lastRoomUsed of topics
   * that would make sense)
   * ... but after 10 minutes the response should be, "Would you like me to
   * play that in the kitchen or bedroom?"
   *
   */
  setTopicMetadata(topicId, field, value) {
    this.metadata.topic[topicId][field] = value;
  }

  /**
   * Retrive topic metadata that has been stored based data that does not
   * reset after a conversation
   * @param {string} topicId The topic of the metadata or "bucket"
   * @param {field} field Field name
   *
   * @return {string} value of the topic metadata
   */
  getTopicMetadata(topicId, field) {
    return this.metadata.topic[topicId][field];
  }

  /**
   * Get the current statement
   * @return {string} The current statement
   */
  getStatement() {
    return this.statement;
  }

  /**
   * Set the current statement
   * @param {string} value Value of current statement
   */
  setStatement(value) {
    this.statement = value;
    this.save();
  }

  /**
   * Get the replyTo of the conversation
   * @return {string} The replyTo of the converstaion
   */
  getReplyTo() {
    return this.replyTo;
  }

  /**
   * Set the replyTo of the conversation
   * @param {string} value Value to set the replyTo to
   */
  setReplyTo(value) {
    this.replyTo = value;
    this.save();
  }

  /**
   * Get the action of the conversation
   *
   * @return {string} The action of the converstaion
   */
  getIntent() {
    return this.intent;
  }

  /**
   * Set the action of the conversation
   * @param {string} value Value to set the action to
   */
  setIntent(value) {
    this.intent = value;
    this.save();
  }

  /**
   * Get the current query field
   *
   * @return {string} The query field name
   */
  getQuery() {
    return this.query;
  }

  /**
   * Set the query field we are asking for next
   * @param {string} value Field name for the query
   */
  setQuery(value) {
    this.query = value;
    this.save();
  }

  /**
   * Get a field of the conversation
   * @param {string} fieldName Field name to set
   *
   * @return {string} The field value
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
   *
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
   *
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
   *
   * @return {string} The context of the converstaion
   */
  getContext() {
    return this.context;
  }

  /**
   * Set the context of the conversation
   * @param {string} value Value to set the context to
   */
  setContext(value) {
    if (this.fields.initialContext === undefined) {
      this.fields.initialContext = value;
    }
    this.context = value;
    this.save();
  }

  /**
   * Get the action of the conversation
   *
   * @return {string} The action of the converstaion
   */
  getTopic() {
    return this.topic;
  }

  /**
   * Set the topic of the conversation
   * @param {string} value Value to set the topic to
   */
  setTopic(value) {
    this.topic = value;
    this.save();
  }

  /**
   * Set the final reply, and update the state to ensure no other reply is
   * present
   * @param {string} final The reply that is set to final
   *
   * @return {Object} current state
   */
  setFinal(final) {
    this.final = final;
    this.reply = undefined;
    this.save();
    return this;
  }

  /**
   * Get final reply
   *
   * @return {string} Final reply
   */
  getFinal() {
    return this.final;
  }

  /**
   * Get non final reply
   *
   * @return {string} Non final reply
   */
  getReply() {
    return this.reply;
  }

  /**
   * Set the reply and expect a response
   * @param {string} reply Response to user from Edwin
   *
   * @return {Object} Current state
   */
  setReply(reply) {
    this.reply = reply;
    this.final = undefined;
    this.save();
    return this;
  }

  /**
   * Check if conversation has just started
   *
   * @return {Boolean} True if the conversation is new
   */
  isNewConversation() {
    return this.getQuery() === undefined && this.notResponded();
  }

  /**
   * Return true if final or reply has been set
   *
   * @return {Boolean}
   */
  notResponded() {
    return this.getFinal() === undefined && this.getReply() === undefined;
  }
}

module.exports = State;
