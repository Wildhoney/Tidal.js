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
        url    = 'http://' + config['websocket_connection']['ip_address'] + ':' + config['websocket_connection']['port'];

    strategies.fetchAll().then(function then(strategies) {

        /**
         * @method getStrategy
         * @return {Object}
         */
        var getStrategy = function getStrategy() {

            // ...And then finally assign a random strategy from the pool.
            var strategyIndex = (Math.random() * (strategies.length - 1));
            return strategies[strategyIndex];

        }.bind(this);

        /**
         * @method completedAll
         * @return {void}
         */
        var completedAll = function completedAll() {
            console.log('Successfully Completed All!');
        };

        /**
         * @method completedOne
         * @param args {Array}
         * @return {void}
         */
        var completedOne = function completedOne(args) {
            console.log('Successfully Completed One: ' + args[0].name);
        };

        /**
         * @method failedOne
         * @param args {Array}
         * @return {void}
         */
        var failedOne = function failedOne(args) {
            console.log('Failed One: ' + args[0].name + ' because: ' + args[1]);
        };

        // Determine the concurrent connections, where 10 is the default.
        var concurrentConnections = config['websocket_connection']['concurrent'] || 10;

        // Iterate over the amount of connections we wish to make initially.
        for (var index = 0; index < concurrentConnections; index++) {

            // Instantiate a client, establish a connection to the WebSocket server.
            var client = new Client();
            client.establishConnection(url);

            // Add a random strategy for the client to process.
            client.addStrategy(getStrategy());

            // Configure the callbacks for the client messages.
            client.on('completed/one', completedOne.bind(client));
            client.on('completed/all', completedAll.bind(client));
            client.on('failed/one', failedOne.bind(client));

        }

    });

})();