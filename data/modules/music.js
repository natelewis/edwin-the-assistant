const appConfig = require('../../lib/config');
let sonosConfig = appConfig.get('sonos');
let Promise = require('promise');
let request = require('request');


module.exports = {
  run: function(dialog, config, callback, debug) {
    debug && console.log('music: ' + dialog.state.statement);
    let sonosCommand;
    let sonosFinal;
    let zone = '';

    // normalize things to resume
    dialog.state.statement = dialog.state.statement.replace(/play music/i, 'resume');

    // if we are not talking about playing anything change back on for resume
    if (dialog.state.statement.match(/play/i) === null) {
      dialog.state.statement = dialog.state.statement.replace(/back on/i, 'resume');
    }

    // if there is a follow up question, this was the original intent to sonos
    if (typeof (dialog.state.sonosAction) === 'undefined') {
      dialog.state.sonosAction = dialog.state.statement;
    }
    debug && console.log('music: getting zones');
    // get the zones and run command logic
    this.getZones(debug).then(function(json) {
      let roomsPlaying = [];
      let rooms = [];
      json = JSON.parse(json);
      for (let i = 0; i < json.length; i++) {
        let coordinator = json[i].coordinator;
        let roomName = coordinator.roomName;
        rooms.push(roomName);

        // list only rooms that are playing
        if (coordinator.dialog.state.playbackState === 'PLAYING') {
          roomsPlaying.push(roomName);
        }

        // check for match regex
        let re = new RegExp(roomName, 'gi');
        if (dialog.state.statement.match(re)) {
          zone = roomName;
        }
      }

      if (roomsPlaying.length === 1) {
        zone = roomsPlaying[0];
      }

      debug && console.log('sonos: rooms: ' + rooms.toString());
      debug && console.log('sonos: roomsPlaying: ' + roomsPlaying.toString());
      debug && console.log('sonos: zone: ' + zone);

      if (dialog.state.statement.match(/pause/i) && zone === '') {
        debug && console.log('sonos: pausing all');
        sonosCommand = '/pauseall';
        sonosFinal = 'done';
      } else if (dialog.state.statement.match(/resume/i) && zone === '') {
        debug && console.log('sonos: resume paused');
        sonosCommand = '/resumeall';
        sonosFinal = 'done';
      } else if (dialog.state.statement.match(/resume/i)) {
        debug && console.log('sonos: playing in ' + zone);
        sonosCommand = '/' + zone + '/play';
        sonosFinal = 'done';
      } else if (dialog.state.statement.match(/pause/i)) {
        debug && console.log('sonos: pausing in ' + zone);
        sonosCommand = '/' + zone + '/pause';
        sonosFinal = 'done';
      } else if (dialog.state.action.match(/(skip|next)/i)) {
        if (zone === '') {
          dialog.state.reply = 'I didn\'t catch what room. Choose from '
            + roomsPlaying.join(' or ');
          dialog.state.query = 'room';
          return dialog.finish();
        } else {
          sonosCommand = '/' + zone + '/next';
          sonosFinal = 'uh-huh';
        }
      } else if (dialog.state.statement.match(/(up|down)/i) ||
                 dialog.state.sonosAction.match(/(up|down)/i)) {
        if (zone === '') {
          dialog.state.reply = 'I didn\'t catch what room. You can choose '
            + rooms.toString();
          dialog.state.query = 'room';
          return dialog.finish();
        } else {
          debug && console.log('sonos: up/down');
          let volumeDirection = '-';
          if (dialog.state.statement.match(/(up)/i)) {
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
        dialog.state.final = sonosFinal;
      } else {
        dialog.state.reply = 'I don\'t know how to have sonos do that yet,'
          + ' try another way of saying it?';
      }
      return dialog.finish();
    }).catch(function(err) {
      console.log(err);
      dialog.state.final = 'Something is wrong, sorry have to try again later';
      return dialog.finish();
    });

    // bail if we are doing dry-run
    if (dialog.fulfillmentType === 'dry-run') {
      dialog.state.final = 'No sonos commands sent, dry run only';
      return dialog.finish();
    }

    // final will be handled in the callback, but we are done here
    dialog.setFinal(undefined);
    return;
  },
  getZones: function(debug) {
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
  },
  getRooms: function(debug) {
    debug && console.log('sonos: getRooms');

    return this.getZones(debug).then(function(json) {
      let rooms = [];
      json = JSON.parse(json);
      for (let i = 0; i < json.length; i++) {
        rooms.push(json[i].coordinator.roomName);
      }
      return rooms;
    });
  },
};
