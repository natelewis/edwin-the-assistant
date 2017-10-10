'use strict';

const getZones = (sonosConfig) => {
  return new Promise(function(resolve, reject) {
    if (sonosConfig.URI === undefined) {
      return resolve( '{}' );
    }

    let options = {
      rejectUnauthorized: false,
      method: 'GET',
      uri: sonosConfig.URI + '/zones',
      headers: {
        'Authorization': 'Basic ' +
          new Buffer('admin:password').toString('base64'),
      },
    };
    request(options, function(err, res, body) {
      if (err) {
        console.log(err);
        return reject(err);
      } else if (res.statusCode !== 200) {
        console.log(res);
        err = new Error('Unexpected status code: ' + res.statusCode);
        err.res = res;
        return reject(err);
      }
      return resolve(body);
    });
  });
};

const getRooms = (sonosConfig) => {
  debug && console.log('sonos: getRooms');

  return getZones(sonosConfig).then(function(json) {
    let rooms = [];
    json = JSON.parse(json);
    for (let i = 0; i < json.length; i++) {
      rooms.push(json[i].coordinator.roomName);
    }
    return rooms;
  });
};

module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    const appConfig = require('./../../lib/config');
    const sonosConfig = appConfig.get('sonos');
    const request = require('request');

    const debug = false;
    let statement = state.getStatement();
    let dialog = {};
    dialog.fulfillmentType = 'dry-run';

    // turned off for now
    state.setFinal(' ');
    state.finish();
    return resolve(state);



    debug && console.log('music: ' + statement);
    let sonosCommand;
    let sonosFinal;
    let zone = '';

    // normalize things to resume
    statement = statement.replace(/play music/i, 'resume');

    // if we are not talking about playing anything change back on for resume
    if (statement.match(/play/i) === null) {
      statement = statement.replace(/back on/i, 'resume');
    }

    // if there is a follow up question, this was the original intent to sonos
    if (state.getField('sonosAction') === undefined) {
      state.setField('sonosAction', 'statement');
    }
    debug && console.log('music: getting zones');
    // get the zones and run command logic
    getZones(sonosConfig).then(function(json) {
      let roomsPlaying = [];
      let rooms = [];
      json = JSON.parse(json);
      for (let i = 0; i < json.length; i++) {
        let coordinator = json[i].coordinator;
        let roomName = coordinator.roomName;
        rooms.push(roomName);
/*
        // list only rooms that are playing
        if (coordinator.dialog.state.playbackState === 'PLAYING') {
          roomsPlaying.push(roomName);
        }
        */

        // check for match regex
        let re = new RegExp(roomName, 'gi');
        if (statement.match(re)) {
          zone = roomName;
        }
      }

      if (roomsPlaying.length === 1) {
        zone = roomsPlaying[0];
      }

      debug && console.log('sonos: rooms: ' + rooms.toString());
      debug && console.log('sonos: roomsPlaying: ' + roomsPlaying.toString());
      debug && console.log('sonos: zone: ' + zone);

      if (statement.match(/pause/i) && zone === '') {
        debug && console.log('sonos: pausing all');
        sonosCommand = '/pauseall';
        sonosFinal = 'done';
      } else if (statement.match(/resume/i) && zone === '') {
        debug && console.log('sonos: resume paused');
        sonosCommand = '/resumeall';
        sonosFinal = 'done';
      } else if (statement.match(/resume/i)) {
        debug && console.log('sonos: playing in ' + zone);
        sonosCommand = '/' + zone + '/play';
        sonosFinal = 'done';
      } else if (statement.match(/pause/i)) {
        debug && console.log('sonos: pausing in ' + zone);
        sonosCommand = '/' + zone + '/pause';
        sonosFinal = 'done';
      } else if (state.getIntent().match(/(skip|next)/i)) {
        if (zone === '') {
          state.setReply('I didn\'t catch what room. Choose from '
            + roomsPlaying.join(' or ')
          );
          state.setQuery('room');
          state.finish();
          return resolve(state);
        } else {
          sonosCommand = '/' + zone + '/next';
          sonosFinal = 'uh-huh';
        }
      } else if (statement.match(/(up|down)/i) ||
          state.getField('sonosAction').match(/(up|down)/i)) {
        if (zone === '') {
          state.setReply('I didn\'t catch what room. You can choose '
            + rooms.toString());
          state.setQuery('room');
          state.finish();
          return resolve(state);
        } else {
          debug && console.log('sonos: up/down');
          let volumeDirection = '-';
          if (statement.match(/(up)/i)) {
            volumeDirection = '+';
          }
          sonosCommand = '/' + zone + '/volume/' + volumeDirection + '10';
          sonosFinal = 'uh-huh';
        }
      }

      debug && console.log('sonos: command: ' + sonosCommand);

      // we have a command lets do it!
      if (typeof (sonosCommand) !== 'undefined') {
        if (dialog.fulfillmentType !== 'dry-run') {
          debug && console.log('sonos: Sending ' + sonosConfig.URI
            + sonosCommand);
          let options = {
            rejectUnauthorized: false,
            method: 'GET',
            uri: sonosConfig.URI + sonosCommand,
            headers: {
              'Authorization': 'Basic '
                + new Buffer('admin:password').toString('base64'),
            },
          };

          request(options, function(error, response, body) {
            console.log(error);
          });
        }
        state.setFinal(sonosFinal);
        state.finish();
        return resolve(state);
      } else {
        state.setReply('I don\'t know how to have sonos do that yet,'
          + ' try another way of saying it?');
        state.finish();
        return resolve(state);
      }
    }).catch(function(err) {
      console.log(err);
      state.setFinal('Something is wrong, sorry have to try again later');
      state.finish();
      return resolve(state);
    });

    // bail if we are doing dry-run
    if (dialog.fulfillmentType === 'dry-run') {
      state.setFinal('No sonos commands sent, dry run only');
      state.finish();
      return resolve(state);
    }

    // final will be handled in the callback, but we are done here
    state.setFinal(' ');
    state.finish();
    return resolve(state);
  });
}};
