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
    process.stdout.write(this.getTimestamp() + ' STATE: ');
    console.log(stateCopy);
  },
};
