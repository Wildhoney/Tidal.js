(function($app, $io) {

    "use strict";

    /**
     * @service Client
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.service('Client', ['$rootScope', '$http', '$interpolate',

    function Client($rootScope, $http, $interpolate) {

        /**
         * @constant ASSERTION_FAILED
         * @type {String}
         */
        var ASSERTION_FAILED = 'assertion';

        /**
         * @constant STRATEGY_COMPLETED
         * @type {String}
         */
        var STRATEGY_COMPLETED = 'completed';

        /**
         * @constant STRATEGY_DISCONNECTED
         * @type {String}
         */
        var STRATEGY_DISCONNECTED = 'disconnected';

        /**
         * @model ClientModel
         * @constructor
         */
        function ClientModel() {

            // Connect to the Socket.io server!
            this.socket = $io.connect('http://localhost:3001');

            // Fetch a random user to impersonate real people.
            $http.get('http://api.randomuser.me/', {}).then(_.bind(function (response) {

                // Assign the user to the client model.
                this.model = response.data.results[0].user;

                // Begin the process of processing the assigned strategy.
                this.processStrategy();

            }, this));

        }

        /**
         * @property prototype
         * @type {Object}
         */
        ClientModel.prototype = {

            /**
             * @property model
             * @type {Object}
             */
            model: {},

            /**
             * @property responders
             * @type {Array}
             */
            responders: [],

            /**
             * @property strategy
             * @type {Object}
             */
            strategy: {},

            /**
             * @property memory
             * @type {Object}
             */
            memory: {},

            /**
             * @property socket
             * @type {Object}
             */
            socket: {},

            /**
             * Assign a strategy that the client should be responsible for completing.
             *
             * @method assignStrategy
             * @param strategy {Object}
             * @return {void}
             */
            assignStrategy: function assignStrategy(strategy) {
                this.strategy = strategy;
            },

            /**
             * Assign events that can be broadcasted by the server, which could defer
             * any strategies currently being processed.
             *
             * @method assignResponders
             * @param responders {Array}
             * @return {void}
             */
            assignResponders: function assignResponders(responders) {
                this.responders = responders;
            },

            /**
             * @method disconnect
             * @return {void}
             */
            disconnect: function disconnect() {

                this.socket.disconnect();

                $rootScope.$broadcast('client/disconnected', {
                    client: this,
                    type: STRATEGY_DISCONNECTED,
                    result: 'success'
                });

            },

            /**
             * Begin or continue processing the strategy that the client is responsible for.
             *
             * @method processStrategy
             * @return {void}
             */
            processStrategy: function processStrategy() {

                // Determine if we've completed the assigned strategy.
                if (this.strategy.steps.length === 0) {

                    $rootScope.$broadcast('client/completed_strategy', {
                        client: this,
                        type: STRATEGY_COMPLETED,
                        result: 'success'
                    });

                    return;

                }

                // While there are tasks within the strategy to be completed.
                while (this.strategy.steps.length) {

                    // Take the first step from the strategy.
                    var task = this.strategy.steps.shift();

                    if (task.type === 'on') {

                        // If the type is "on" then we need to wait for the server to
                        // send the event to us.
                        this._awaitEvent(task);
                        break;

                    }

                    var data = {};

                    if (task.with) {

                        // Configure the data to be sent with the request if it has been defined.
                        // We also need to interpolate the data with anything that may be stored
                        // in the `memory` property from previous requests.
                        for (var key in task.with) {

                            if (task.with.hasOwnProperty(key)) {

                                // Interpolate the data!
                                data[key] = $interpolate(task.with[key])(this.memory);

                            }
                        }

                    }

                    // Otherwise we can emit the event immediately.
                    this.socket.emit(task.event, data);

                }

            },

            /**
             * @method _awaitEvent
             * @param step {Object}
             * @return {void}
             * @private
             */
            _awaitEvent: function _awaitEvent(step) {

                this.socket.on(step.event, _.bind(function eventReceived(data) {

                    // Iterate over each of the expected properties and their
                    // corresponding values.
                    for (var key in step.expect) {

                        // The usual suspect!
                        if (step.expect.hasOwnProperty(key)) {

                            if (step.expect[key] !== data[key]) {

                                // Throw an error that the client got an invalid value.
                                $rootScope.$broadcast('client/invalid_property_value', {
                                    client: this,
                                    type: ASSERTION_FAILED,
                                    result: 'failure',
                                    property: key,
                                    expected: step.expect[key],
                                    actual: data[key]
                                });

                            }

                        }

                    }

                    if (step.store) {

                        // Store this is the `store` property has been defined.
                        this.memory[step.store] = data;
                    }

                    // Continue the processing of the strategy.
                    this.processStrategy();

                }, this));

            }

        };

        return ClientModel;

    }]);

})(window.tidalApp, window.io);