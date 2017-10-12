'use strict';

const fs = require('fs');

const test = require('./test');

const testDir = './data/tests';

const files = fs.readdirSync(testDir);
files.forEach((file) => {
  const json = fs.readFileSync(testDir + '/' + file, 'utf-8');
  const testObj = JSON.parse(json.toString());
  testObj.conversations.forEach((rules) => {
    test.conversation(rules);
  });
});
