const config = require('../../config');
var Promise = require('promise');
var request = require('request');

module.exports = {
    run: function (state, callback, debug) {
        debug && console.log('music: ' + state.statement);
        var sonosCommand;
        var sonosFinal;
        var zone = '';

        // normalize things to resume
        state.statement = state.statement.replace(/play music/i, 'resume');

        // if we are not talking about playing anything change back on for resume
        if (state.statement.match(/play/i) === null) {
            state.statement = state.statement.replace(/back on/i, 'resume');
        }

        // if there is a follow up question, this was the original intent to sonos
        if (typeof (state.sonosAction) === 'undefined') {
            state.sonosAction = state.statement;
        }

        // get the zones and run command logic
        this.getZones(debug).then(function (json) {
            var roomsPlaying = [];
            var rooms = [];
            json = JSON.parse(json);
            for (var i = 0; i < json.length; i++) {
                var coordinator = json[i].coordinator;
                var roomName = coordinator.roomName;
                rooms.push(roomName);

                // list only rooms that are playing
                if (coordinator.state.playbackState === 'PLAYING') {
                    roomsPlaying.push(roomName);
                }

                // check for match regex
                var re = new RegExp(roomName, 'gi');
                if (state.statement.match(re)) {
                    zone = roomName;
                }
            }

            if (roomsPlaying.length === 1) {
                zone = roomsPlaying[0];
            }

            debug && console.log('sonos: rooms: ' + rooms.toString());
            debug && console.log('sonos: roomsPlaying: ' + roomsPlaying.toString());
            debug && console.log('sonos: zone: ' + zone);

            if (state.statement.match(/pause/i) && zone === '') {
                debug && console.log('sonos : pausing all');
                sonosCommand = '/pauseall';
                sonosFinal = 'done';
            } else if (state.statement.match(/resume/i) && zone === '') {
                debug && console.log('sonos : resume paused');
                sonosCommand = '/resumeall';
                sonosFinal = 'done';
            } else if (state.statement.match(/resume/i)) {
                debug && console.log('sonos : playing in ' + zone);
                sonosCommand = '/' + zone + '/play';
                sonosFinal = 'done';
            } else if (state.statement.match(/pause/i)) {
                debug && console.log('sonos : pausing in ' + zone);
                sonosCommand = '/' + zone + '/pause';
                sonosFinal = 'done';
            } else if (state.action.match(/(skip|next)/i)) {
                if (zone === '') {
                    state.reply = 'I didn\'t catch what room. Choose from ' + roomsPlaying.join(' or ');
                    state.query = 'room';
                    return callback(state);
                } else {
                    sonosCommand = '/' + zone + '/next';
                    sonosFinal = 'uh-huh';
                }
            } else if (state.statement.match(/(up|down)/i) || state.sonosAction.match(/(up|down)/i)) {
                if (zone === '') {
                    state.reply = 'I didn\'t catch what room. You can choose ' + rooms.toString();
                    state.query = 'room';
                    return callback(state);
                } else {
                    debug && console.log('sonos : up/down');
                    var volumeDirection = '-';
                    if (state.statement.match(/(up)/i)) {
                        volumeDirection = '+';
                    }
                    sonosCommand = '/' + zone + '/volume/' + volumeDirection + '10';
                    sonosFinal = 'uh-huh';
                }
            }

            debug && console.log('sonos: command: ' + sonosCommand);

            // we have a command lets do it!
            if (typeof (sonosCommand) !== 'undefined') {
                if (state.fulfillmentType !== 'dry-run') {
                    debug && console.log('sonos: Sending ' + config.sonos.URI + sonosCommand);
                    var options = {
                        rejectUnauthorized: false,
                        method: 'GET',
                        uri: config.sonos.URI + sonosCommand,
                        headers: {
                            'Authorization': 'Basic ' + new Buffer('admin:password').toString('base64')
                        }
                    };

                    request(options, function (error, response, body) {
                        console.log(error);
                    });
                }
                state.final = sonosFinal;
            } else {
                state.reply = 'I don\'t know how to have sonos do that yet, try another way of saying it?';
            }
            return callback(state);
        });

        // bail if we are doing dry-run
        if (state.fulfillmentType === 'dry-run') {
            state.final = 'No sonos commands sent, dry run only';
            return callback(state);
        }
    },
    getZones: function (debug) {
        var options = {
            rejectUnauthorized: false,
            method: 'GET',
            uri: config.sonos.URI + '/zones',
            headers: {
                'Authorization': 'Basic ' + new Buffer('admin:password').toString('base64')
            }
        };

        return new Promise(function (resolve, reject) {
            request(options, function (err, res, body) {
                if (err) {
                    return reject(err);
                } else if (res.statusCode !== 200) {
                    err = new Error('Unexpected status code: ' + res.statusCode);
                    err.res = res;
                    return reject(err);
                }
                resolve(body);
            });
        });
    },
    getRooms: function (debug) {
        debug && console.log('sonos: getRooms');

        return this.getZones(debug).then(function (json) {
            var rooms = [];
            json = JSON.parse(json);
            for (var i = 0; i < json.length; i++) {
                rooms.push(json[i].coordinator.roomName);
            }
            return rooms;
        });
    }
};
