/**
 * @module Tidal
 * @author Adam Timberlake
 */
(function Tidal($math, $process) {

    "use strict";

    var yaml       = require('js-yaml'),
        fs         = require('fs'),
        clc        = require('cli-color'),
        cp         = require('child_process'),
        strategies = require(__dirname + '/component/Strategies.js');

    /**
     * @method outputMessage
     * @param type {String}
     * @param message {String}
     * @return {void}
     */
    var outputMessage = function outputMessage(type, message) {

        /**
         * @method which
         * @param type {String}
         * @return {Object}
         */
        var which = function which(type) {

            switch (type) {
                case 'success': return { colour: 46, icon: '✓' };
                case 'failure': return { colour: 197, icon: '×' };
                case 'info':    return { colour: 117, icon: '•' };
            }

        };

        var icon = clc.xterm(which(type).colour),
            msg  = clc.xterm(7);

        $process.stdout.write(icon(' ' + which(type).icon + '  '));
        $process.stdout.write(msg(message) + "\n");

    };

    // Load the Tidal YAML configuration file for specifying the WebSocket connection credentials,
    // and other options such as the desired level of concurrency.
    var config     = yaml.safeLoad(fs.readFileSync(__dirname + '/../tidal.yaml', 'utf8')),
        url        = 'http://' + config['websocket_connection']['ip_address'] + ':' + config['websocket_connection']['port'],
        iterations = 0,
        clients    = [];

    // Fetch all of the user defined strategies.
    strategies.fetchAll().then(function then(strategies) {

        /**
         * Acts as a factory method for instantiating a new client, and setting up the necessary
         * callbacks for handling various scenarios, and states in which the client can be in.
         *
         * @method addClient
         * @return {void}
         */
        var addClient = function addClient() {

            // Fork a new client for processing a strategy.
            var client = cp.fork(__dirname + '/component/Client.js');
            clients.push(client);

            // Connect to the WebSocket server, and assign a random strategy.
            client.send({ type: 'websocket_url', value: url });
            client.send({ type: 'add_strategy', value: getRandomStrategy() });

            // When a message has been received from the client process.
            client.on('message', function receivedMessage(args) {

                switch (args.type) {

                    // Once the client has completed one strategy.
                    case 'strategy_complete': completedOne(args.value); break;

                    // ...And completed all assigned strategies.
                    case 'strategies_complete': completedAll(client); break;

                    // When the client has been disconnected.
                    case 'client_disconnected': disconnected(); break;

                    // When an error has occurred when processing a strategy.
                    case 'strategy_failed':
                        args.value.client = client;
                        failedOne(args.value);
                        break;

                }

            });

        };

        /**
         * Responsible for returning a random strategy from the pool of strategies.
         *
         * @method getRandomStrategy
         * @return {Object}
         */
        var getRandomStrategy = function getRandomStrategy() {

            // ...And then finally assign a random strategy from the pool.
            var strategyIndex = $math.round($math.random() * (strategies.length - 1));
            return strategies[strategyIndex];

        }.bind(this);

        /**
         * Responsible for notifying the end-user when one of the strategies has been completed.
         * In most cases this is likely to be everything, but that's handled by a separate event --
         * the "completed/one" event.
         *
         * @method completedOne
         * @param strategy {Object}
         * @return {void}
         */
        var completedOne = function completedOne(strategy) {

            iterations++;
            outputMessage('success', 'Strategy Complete: ' + strategy.name);

            if (iterations === config.iterations) {

                // ..But first we need to end all of the child processes.
                clients.forEach(function forEach(client) {
                    client.kill();
                });

                // Exit Node.js if we've satisfied the desired iterations.
                $process.exit(1);

            }

        };

        /**
         * Responsible for reporting any failures that may occur in the client -> server
         * connection, and to then disconnect them, and to spawn a new user.
         *
         * @method failedOne
         * @param args {Object}
         * @return {void}
         */
        var failedOne = function failedOne(args) {
            outputMessage('failure', 'Failed One: ' + args.strategy.name + ' because: ' + args.message);
            args.client.send({ type: 'disconnect', value: null });
        };

        /**
         * Responsible for listening for when a client has disconnected from the server, and
         * to then to create another client connection to maintain the concurrency.
         *
         * @method disconnected
         * @return {void}
         */
        var disconnected = function disconnected() {
            outputMessage('info', 'Client Disconnected');
            addClient();
        };

        /**
         * @method completedAll
         * @param client {Client}
         * @return {void}
         */
        var completedAll = function completedAll(client) {

            outputMessage('success', 'Strategies Completed');

            // Determine whether we want to give this client another strategy.
            if (config['after_complete'] === 'random' && $math.random() > 0.5) {
                client.send({ type: 'add_strategy', value: getRandomStrategy() });
                return;
            }

            // Otherwise we'll disconnect the client.
            client.send({ type: 'disconnect', value: null });

        };

        // Determine the concurrent connections, where 10 is the default.
        var concurrentConnections = config['websocket_connection']['concurrent'] || 10;

        // Iterate over the amount of connections we wish to make initially.
        for (var index = 0; index < concurrentConnections; index++) {
            addClient();
        }

    });

})(Math, process);