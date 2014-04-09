/**
 * @module Tidal
 * @submodule Client
 * @author Adam Timberlake
 */
(function TidalClient() {

    "use strict";

    var io = require('socket.io-client');

    /**
     * @class Client
     * @constructor
     */
    function Client() {}

    /**
     * @property prototype
     * @type {Object}
     */
    Client.prototype = {

        /**
         * @property interval
         * @type {Object}
         */
        interval: {},

        /**
         * @property strategies
         * @type {Array}
         */
        strategies: [],

        /**
         * @property socket
         * @type {Object}
         */
        socket: {},

        /**
         * @method _startProcessing
         * @return {void}
         * @private
         */
        _startProcessing: function _startProcessing() {

            var processor = function processor() {

                var strategy = this.strategies[0];

                if (typeof strategy === 'undefined') {

                    // Clear the interval because this client has nothing to process.
                    clearInterval(this.interval);
                    return;

                }

                // Obtain the first event.
                var task = strategy.path.shift();

                if (task.type === 'on') {

                    // We're waiting for an event.
                    clearInterval(this.interval);

                    // Setup our socket to wait for this event before continuing.
                    this.socket.on(task.event, function receivedEvent() {

                        // Remove the listener event, since we've just received it.
                        this.socket.removeListener(task.event);

                        if (task.expect) {

                            // Recursively validate each expected property.
                            this._validateResponse(task.expect, arguments, []);

                        }

                    }.bind(this));

                }

                // Emit the event with the required parameters.
                this.socket.emit(task.event, task.with);

                // Determine the type of the next event. If it's "on", then we'll setup a wait
                // event for that event name.
                if (typeof strategy.path[0] !== 'undefined' && strategy.path[0].type === 'on') {

                    // Invoke the processor method again immediately to configure the event
                    // before the next runtime loop, in which time the event may have come and gone.
                    processor.bind(this);

                }

            }.bind(this);

            // Clear the interval if it's a valid interval object, and begin the processing.
            clearInterval(this.interval);
            this.interval = setInterval(processor, 1);

        },

        /**
         * @method _validateResponse
         * @param expect {Object}
         * @param args {Object|Array}
         * @param property {Array}
         * @return {void}
         * @private
         */
        _validateResponse: function _validateResponse(expect, args, property) {

            // Iterate over each expected value.
            for (var item in expect) {

                // Usual suspect!
                if (expect.hasOwnProperty(item)) {

                    // We need to go deeper if this validates.
                    if (typeof expect[item] === 'object') {

                        // Recursive call to own method.
                        property.push(item);
                        this._validateResponse(expect[item], args, property);
                        return;

                    }

                    // Voila! Complete the property chain!
                    property.push(item);

                    // Will be populated with the actual value from the WebSocket server.
                    var actualValue = {};

                    // Now we can correspond the property chain to a value in the arguments
                    // from the WebSocket event.
                    property.forEach(function forEach(propertyItem) {

                        // Resolve using `actualValue` first, otherwise the arguments.
                        actualValue = actualValue[propertyItem] || args[propertyItem];

                    });

                    console.log(actualValue === expect[item]);

                }

            }

        },

        /**
         * @method establishConnection
         * @param url {String}
         * @return {Object}
         */
        establishConnection: function establishConnection(url) {
            this.socket = io.connect(url, {'force new connection': true});
            return this.socket;
        },

        /**
         * @method addStrategy
         * @param strategy {Object}
         * @return {void}
         */
        addStrategy: function addStrategy(strategy) {
            this.strategies.push(strategy);
            this._startProcessing();
        }

    };

    module.exports = Client;

})();