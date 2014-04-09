/**
 * @module Tidal
 * @author Adam Timberlake
 */
(function Tidal() {

    "use strict";

    var yaml       = require('js-yaml'),
        fs         = require('fs'),
        strategies = require(__dirname + '/module/strategies.js'),
        Client     = require(__dirname + '/module/client.js');

    var config = yaml.safeLoad(fs.readFileSync(__dirname + '/../tidal.yaml', 'utf8')),
        url    = 'http://' + config.websocket_connection.ip_address + ':' + config.websocket_connection.port;

    strategies.fetchAll().then(function then(strategies) {

        // Determine the concurrent connections, where 10 is the default.
        var concurrentConnections = config.websocket_connection.concurrent || 10;

        // Iterate over the amount of connections we wish to make initially.
        for (var index = 0; index < concurrentConnections; index++) {

            // Instantiate a client, establish a connection to the WebSocket server.
            var client = new Client();
            client.establishConnection(url);

            // ...And then finally assign a random strategy from the pool.
            client.addStrategy(strategies[0, (strategies.length - 1)]);

        }

    });

})();