/**
 * @module Tidal
 * @submodule Client
 * @author Adam Timberlake
 */
(function TidalClient() {

    "use strict";

    var io       = require('socket.io-client'),
        deepCopy = require('deepcopy');

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
         * @property events
         * @type {Object}
         */
        events: {},

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

                var strategy = this.strategies[0],
                    analysis, result;

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

                        if (task.ignore) {

                            // Perform an actual/expected analysis.
                            analysis = this._findProperties(task.ignore, arguments, [], []);
                            result   = this._didAllPass(analysis);

                            if (result) {

                                // We should ignore it because the event was ignored by the config.
                                return;

                            }

                        }

                        // Remove the listener event, since we've just received it.
                        this.socket.removeListener(task.event);

                        if (task.expect) {

                            // Recursively validate each expected property.
                            analysis = this._findProperties(task.expect, arguments, [], []),
                            result   = this._didAllPass(analysis);

                            if (result) {
                                // All is good!
                            }

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

                // Determine if we've finished processing this strategy.
                if (strategy.path.length === 0) {

                    this.strategies.shift();
                    this._invokeCallback('strategy/completed/one', strategy);

                    // Determine whether to stop the processing or not.
                    if (this.strategies.length === 0) {
                        clearInterval(this.interval);
                        this._invokeCallback('strategy/completed/all', strategy);
                    }

                }

            }.bind(this);

            // Clear the interval if it's a valid interval object, and begin the processing.
            clearInterval(this.interval);
            this.interval = setInterval(processor, 1);

        },

        /**
         * @method on
         * @param eventName {String}
         * @param callback {Function}
         * @return {void}
         */
        on: function on(eventName, callback) {
            this.events[eventName] = callback;
        },

        /**
         * @method _invokeCallback
         * @param eventName {String}
         * @param args {Object|Array|String|Boolean|Number}
         * @return {void}
         * @private
         */
        _invokeCallback: function _invokeCallback(eventName, args) {
            this.events[eventName].call(null, Array.prototype.slice.apply(arguments));
        },

        /**
         * @method _didAllPass
         * @param analysis {Array}
         * @return {Boolean}
         * @private
         */
        _didAllPass: function _didAllPass(analysis) {

            var allPassed = true;

            // Analyse the results so we know whether all of them passed or not.
            for (var index = 0; index < analysis.length; index++) {

                // Determine whether the values differ.
                if (analysis[index].expected !== analysis[index].actual) {
                    allPassed = false;
                }

            }

            return allPassed;

        },

        /**
         * @method _findProperty
         * @param expected {Object}
         * @param data {Object|Array}
         * @param property {Array}
         * @param values {Object}
         * @return {Array|String|Boolean|Number}
         * @private
         */
        _findProperties: function _findProperties(expected, data, property, values) {

            for (var item in expected) {

                // Usual suspect!
                if (expected.hasOwnProperty(item)) {

                    // Create a string chain of all the properties.
                    var propertyPath = (property + '.' + item).replace(/^\.+/, '');

                    // Find the current value.
                    var value = this._findPropertyByString(propertyPath, data);

                    // If it's an object then we need to keep iterating.
                    if (typeof value === 'object') {

                        this._findProperties(expected[item], data, propertyPath, values);
                        continue;

                    }

                    // We've come to the end of the path so add an entry.
                    values.push({ property: propertyPath, expected: expected[item], actual: value });

                }

            }

            return values;

        },

        /**
         * @method _findPropertyByString
         * @param property {String}
         * @param data {Object|Array}
         * @return {String|Array|Object|Boolean}
         * @private
         */
        _findPropertyByString: function _findPropertyByString(property, data) {

            // Will be populated with the actual value from the WebSocket server.
            var value = {},
                parts = property.split(/\./gi);

            // Now we can correspond the property chain to a value in the arguments
            // from the WebSocket event.
            parts.forEach(function forEach(propertyItem) {

                // Resolve using `actualValue` first, otherwise the arguments.
                value = value[propertyItem] || data[propertyItem];

            });

            return value;

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
         * @method destroyConnection
         * @return {void}
         */
        destroyConnection: function destroyConnection() {
            this.socket.disconnect();
        },

        /**
         * @method addStrategy
         * @param strategy {Object}
         * @return {void}
         */
        addStrategy: function addStrategy(strategy) {

            this.strategies.push(deepCopy(strategy));

            // Begin processing in the next run-loop.
            setTimeout(function timeout() {
                this._startProcessing();
            }.bind(this), 1);

        }

    };

    module.exports = Client;

})();