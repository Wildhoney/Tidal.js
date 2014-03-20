(function($app, $io) {

    "use strict";

    /**
     * @service ClientModel
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.service('ClientModel', [function ClientModel() {

        /**
         * @model client
         * @param model {Object}
         * @constructor
         */
        function Client(model) {
            this.model  = model;
            this.socket = $io.connect('http://localhost:3001');
        }

        /**
         * @property prototype
         * @type {Object}
         */
        Client.prototype = {

            /**
             * @property model
             * @type {Object}
             */
            model: {},

            /**
             * @property strategy
             * @type {Object}
             */
            strategy: {},

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
                this._processStrategy();
            },

            /**
             * Begin or continue processing the strategy that the client is responsible for.
             *
             * @method _processStrategy
             * @return {void}
             * @private
             */
            _processStrategy: function _processStrategy() {

                // While there are tasks within the strategy to be completed.
                while (this.strategy.length) {

                    // Take the first step from the strategy.
                    var task = this.strategy.shift();

                    if (task.type === 'on') {

                        // If the type is "on" then we need to wait for the server to
                        // send the event to us.
                        this._awaitEvent(task);
                        break;

                    }

                    // Otherwise we can emit the event immediately.
                    this.socket.emit(task.event, task.with || {});

                    console.log(task.event);

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

                            console.log(step.expect[key] === data[key]);

                        }

                    }

                    // Continue the processing of the strategy.
                    this._processStrategy();

                }, this));

            },

//            /**
//             * Assign events that can be broadcasted by the server, which could interrupt
//             * any strategies currently being executed.
//             *
//             * @method setInterruptEvents
//             * @param events
//             * @return {void}
//             */
//            setInterruptEvents: function setInterruptEvents(events) {
//                return events;
//            }

        };

        return Client;

    }]);

})(window.tidalApp, window.io);