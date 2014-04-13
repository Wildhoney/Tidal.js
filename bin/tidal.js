/**
 * @module Tidal
 * @author Adam Timberlake
 */
(function Tidal($math, $process) {

    "use strict";

    var yaml       = require('js-yaml'),
        fs         = require('fs'),
        clc        = require('cli-color'),
        strategies = require(__dirname + '/module/strategies.js'),
        Client     = require(__dirname + '/module/client.js');

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
         * @return {void}
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
    var config = yaml.safeLoad(fs.readFileSync(__dirname + '/../tidal.yaml', 'utf8')),
        url    = 'http://' + config['websocket_connection']['ip_address'] + ':' + config['websocket_connection']['port'];

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

            // Instantiate a client, establish a connection to the WebSocket server.
            var client = new Client();
            client.establishConnection(url);
            client.addStrategy(getRandomStrategy());

            // Configure the callbacks for the client messages.
            client.on('completed/one', completedOne.bind(client));
            client.on('completed/all', completedAll.bind(client));
            client.on('failed/one', failedOne.bind(client));
            client.on('disconnected', disconnected.bind(client));

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
         * @param args {Array}
         * @return {void}
         */
        var completedOne = function completedOne(args) {
            outputMessage('success', 'Strategy Complete: ' + args[0].name);
        };

        /**
         * Responsible for reporting any failures that may occur in the client -> server
         * connection, and to then disconnect them, and to spawn a new user.
         *
         * @method failedOne
         * @param args {Array}
         * @return {void}
         */
        var failedOne = function failedOne(args) {
            outputMessage('failure', 'Failed One: ' + args[0].name + ' because: ' + args[1]);
            this.destroyConnection();
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
         * @return {void}
         */
        var completedAll = function completedAll() {

            outputMessage('success', 'Strategies Completed');

            // Determine whether we want to give this client another strategy.
            if (config.after_complete === 'random' && $math.random() > 0.5) {
                this.addStrategy(getRandomStrategy());
                return;
            }

            // Otherwise we'll disconnect the client.
            this.destroyConnection();

        };

        // Determine the concurrent connections, where 10 is the default.
        var concurrentConnections = config['websocket_connection']['concurrent'] || 10;

        // Iterate over the amount of connections we wish to make initially.
        for (var index = 0; index < concurrentConnections; index++) {
            addClient();
        }

    });

})(Math, process);