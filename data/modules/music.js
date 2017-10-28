'use strict';

const sonosModule = require('sonos');
const UP = 'up';
const DOWN = 'down';

const setVolume = (sonos, type) => {
  return new Promise(function(resolve, reject) {
    if (type === UP) {
      sonos.getVolume(function(err, volume) {
        volume += 15;
        if (volume > 100) {
          volume = 100;
        }
        sonos.setVolume(volume, function(err, data) {
          return resolve(data);
        });
      });
    }
    if (type === DOWN) {
      sonos.getVolume(function(err, volume) {
        volume -= 15;
        if (volume < 0) {
          volume = 5;
        }
        sonos.setVolume(volume, function(err, data) {
          return resolve(data);
        });
      });
    }
  });
};

const pause = (sonos) => {
  return new Promise(function(resolve, reject) {
    sonos.pause(function(err, data) {
      return resolve(data);
    });
  });
};

const resume = (sonos) => {
  return new Promise(function(resolve, reject) {
    sonos.play(function(err, data) {
      return resolve(data);
    });
  });
};

const next = (sonos) => {
  return new Promise(function(resolve, reject) {
    sonos.next(function(err, data) {
      return resolve(data);
    });
  });
};

module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    const zones = state.getSonosZoneList();

    if (zones.length < 1) {
      state.setFinal('I can\'t find any Sonos devices on your network, sorry!');
      resolve(state);
    } else {
      let statement = state.getStatement();

      // normalize things to resume
      if (statement.replace(/play music/i)) {
        statement = statement.replace(/play music/i, 'resume');
        state.setIntent('resume');
      }

      // if we are not talking about playing anything change back on for resume
      // "turn the music back on"
      if (statement.match(/play/i) === null) {
        statement = statement.replace(/back on/i, 'resume');
        statement = statement.replace(/music on/i, 'resume');
        statement = statement.replace(/on the /i, 'resume');
      }

      // if there is a follow up question, this was the original intent to sonos
      if (state.getField('sonosAction') === undefined) {
        state.setField('sonosAction', statement);
      }

      // figure out what zone we are going to talk to
      let currentZone = undefined;

      // check to see if the zone was said in the statment
      for (let i = 0; i < zones.length; i++) {
        const re = new RegExp(zones[i].name, 'gi');
        if (statement.match(re)) {
          currentZone = zones[i];
        }
      }

      // if we don't have a zone yet, pick the first one
      currentZone = zones[0];

      // do single zone actions that are not playing something
      if (currentZone !== undefined && state.getIntent() !== 'play') {
        const sonos = new sonosModule.Sonos(currentZone.ip);

        // turn volume up default 20 percent
        if (statement.match(/ up/i)) {
          return setVolume(sonos, UP).then(() => {
            resolve(state.setFinal(''));
          });
        }

        // turn volume up default 20 percent
        if (statement.match(/(down|lower)/i)) {
          return setVolume(sonos, DOWN).then(() => {
            resolve(state.setFinal(''));
          });
        }

        // pause
        if (statement.match(/pause/i)) {
          return pause(sonos).then(() => {
            return resolve(state.setFinal(''));
          });
        }

        // resume
        if (statement.match(/resume/i)) {
          return resume(sonos).then(() => {
            return resolve(state.setFinal(''));
          });
        }

        // next
        if (statement.match(/next|skip/i)) {
          return next(sonos).then(() => {
            return resolve(state.setFinal(''));
          });
        }
      } else {
        state.setFinal('I can\'t find a Sonos on my network, sorry!');
      }

      state.setFinal('I don\'t know how to have sonos do that,'
        + ' try another way of saying it?');
      return resolve(state);
    }
  });
}};
