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
         * @type {Object|null}
         */
        socket: null,

        /**
         * @method _startProcessing
         * @return {void}
         * @private
         */
        _startProcessing: function _startProcessing() {
            clearInterval(this.interval);
            this.interval = setInterval(this._process.bind(this), 1);
        },

        /**
         * @method _process
         * @return {void}
         * @private
         */
        _process: function _process() {

            // Determine if the client has processed all of its assigned strategies.
            if (this.strategies.length === 0) {
                this._invokeCallback('completed/all');
                clearInterval(this.interval);
                return;
            }

            // Determine if we're all finished.
            if (this.strategies[0].events.length === 0) {

                // Strategy has been completed!
                var lastStrategy = this.strategies[0];
                this.strategies.shift();

                // We'll also need to emit the "completed/one" event.
                this._invokeCallback('completed/one', lastStrategy);
                return;

            }

            // Fetch the reference to the active strategy, and the first event.
            var strategy = this.strategies[0],
                path     = strategy.events[0];

            // Determine which type of event to process.
            switch (path.type) {
                case ('emit'): this._processEmit(strategy, path); break;
                case ('on'): this._processOn(strategy, path); break;
            }

        },

        /**
         * @method _processOn
         * @param strategy {Object}
         * @param path {Object}
         * @return {void}
         * @private
         */
        _processOn: function _processOn(strategy, path) {

            // Variables that contain the result of the analysis, and whether everything
            // passed or not.
            var analysis, result;

            // Cancel the interval because we're waiting for an event.
            clearInterval(this.interval);

            this.socket.on(path.event, function eventReceived() {

                if (path.ignore) {

                    // Determine if the received event should be ignored.
                    analysis = this._findProperties(path.ignore, arguments, [], []);
                    result   = this._didAllPass(analysis);

                    if (result) {

                        // We should ignore this event because the "ignore" property has
                        // instructed us to ignore it.
                        return;

                    }

                    // Voila! We have the event and it wasn't ignored. We now need to validate
                    // the response to ensure everything is okay with it.
                    analysis = this._findProperties(path.expect, arguments, [], []);
                    result   = this._didAllPass(analysis);

                    // Since the event has been received, we'll remove this event from the
                    // current strategy.
                    strategy.events.shift();

                    if (!result) {

                        // Get all of the failures!
                        var failures = analysis.filter(function filter(item) {
                            return (item.failure === false);
                        });

                        // Uh-oh! Something didn't validate as expected...
                        var message = 'Expected: "' + failures[0].expected + '", actual: "' + failures[0].actual + '"';
                        this._invokeCallback('failed/one', strategy, message);
                        this.strategies.shift();
                        return;

                    }

                    // Otherwise everything is lovely! So we'll need to continue the process.
                    this._startProcessing();

                }

            }.bind(this));

        },

        /**
         * @method _processEmit
         * @param strategy {Object}
         * @param path {Object}
         * @return {void}
         * @private
         */
        _processEmit: function _processEmit(strategy, path) {

            // Emit the event to the WebSocket server.
            this.socket.emit(path.event, path.with);

            // Success so let's remove the event from the list!
            strategy.events.shift();

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
         * @return {void}
         * @private
         */
        _invokeCallback: function _invokeCallback(eventName) {
            this.events[eventName].call(null, Array.prototype.slice.call(arguments, 1));
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
                    var isFailure = (expected[item] === value);
                    values.push({ property: propertyPath, expected: expected[item], actual: value, failure: isFailure });

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
            this.socket = io.connect(url, { 'force new connection': true });
            return this.socket;
        },

        /**
         * @method destroyConnection
         * @return {void}
         */
        destroyConnection: function destroyConnection() {
            this._invokeCallback('disconnected');
            this.socket.disconnect();
        },

        /**
         * @method addStrategy
         * @param strategy {Object}
         * @return {void}
         */
        addStrategy: function addStrategy(strategy) {

            // Produce a deep clone of the strategy to prevent modifying the original.
            this.strategies.push(deepCopy(strategy));

            // Begin processing in the next run-loop.
            setTimeout(function timeout() {
                this._startProcessing();
            }.bind(this), 1);

        }

    };

    module.exports = Client;

})();