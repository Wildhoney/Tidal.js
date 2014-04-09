/**
 * @module Tidal
 * @author Adam Timberlake
 */
(function Tidal() {

    "use strict";

    var yaml       = require('js-yaml'),
        io         = require('socket.io-client'),
        path       = require('path'),
        fs         = require('fs'),
        strategies = require(__dirname + '/module/strategies.js');

    var config = yaml.safeLoad(fs.readFileSync(__dirname + '/tidal.yaml', 'utf8')),
        url    = 'http://' + config.websocket_connection.ip_address + ':' + config.websocket_connection.port;

//    var socket = io.connect(url);
    console.log(strategies.fetchAll());
})();