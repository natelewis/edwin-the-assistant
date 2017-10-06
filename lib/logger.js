'use strict';

const chalk = require('chalk');
const timestamp = require('time-stamp');

module.exports = {
  getTimestamp: function() {
    return '['+chalk.grey(timestamp('HH:mm:ss'))+']';
  },

  info: function(obj) {
    process.stdout.write(this.getTimestamp() + ' ');
    console.log(obj);
  },

  state: function(state) {
    // make a copy
    let stateCopy = Object.assign({}, state);
    // remove the response because it is too much noise
    delete stateCopy.responseObj;
    // send the log out to console
    process.stdout.write(this.getTimestamp() + ' STATE:\n');
    console.log(stateCopy);
  },

  step: function(step) {
    // make a copy
    let stepCopy = Object.assign({}, step);
    // send the log out to console
    process.stdout.write(this.getTimestamp() + ' STEP:\n');
    console.log(stepCopy);
  },
};
