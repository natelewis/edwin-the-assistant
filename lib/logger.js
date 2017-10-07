'use strict';

const chalk = require('chalk');
const timestamp = require('time-stamp');
const Words = require('./words');

module.exports = {
  showTime: function() {
    return '['+chalk.grey(timestamp('HH:mm:ss'))+']';
  },

  info: function(obj) {
    process.stdout.write(this.showTime() + ' ');
    console.log(obj);
  },

  statement: function(statement) {
    process.stdout.write(this.showTime() + ' STATMENT: ' + statement + '\n');
    console.log('    ', new Words(statement).tagged);
  },

  state: function(state) {
    // make a copy
    let stateCopy = Object.assign({}, state);
    // remove the response because it is too much noise
    delete stateCopy.responseObj;
    // send the log out to console
    process.stdout.write(this.showTime() + ' STATE:\n');
    console.log(stateCopy);
  },

  step: function(step) {
    // make a copy
    let stepCopy = Object.assign({}, step);
    // send the log out to console
    process.stdout.write(this.showTime() + ' STEP:\n');
    console.log(stepCopy);
  },
};
