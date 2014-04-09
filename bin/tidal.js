/**
 * @module Tidal
 * @author Adam Timberlake
 */
(function Tidal() {

    "use strict";

    var yaml       = require('js-yaml'),
        io         = require('socket.io-client'),
        fs         = require('fs'),
        strategies = require(__dirname + '/module/strategies.js');

    var config = yaml.safeLoad(fs.readFileSync(__dirname + '/../tidal.yaml', 'utf8')),
        url    = 'http://' + config.websocket_connection.ip_address + ':' + config.websocket_connection.port;

//    var socket = io.connect(url);

    strategies.fetchAll().then(function then(strategies) {

        console.log(strategies);

    });

})();