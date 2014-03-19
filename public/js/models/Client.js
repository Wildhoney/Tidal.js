(function($app, $io) {

    /**
     * @service ClientModel
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.service('ClientModel', ['$q', '$http', function ClientModel($q, $http) {

        /**
         * @model client
         * @param model {Object}
         * @constructor
         */
        function ClientModel(model) {
            this.model  = model;
            this.socket = $io.connect('http://localhost:3001');
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
             * @property task
             * @type {Object}
             */
            task: {},

            /**
             * @property socket
             * @type {Object}
             */
            socket: {},

            /**
             * Assign a task that the client should complete.
             *
             * @method assignTask
             * @param task {Object}
             * @return {void}
             */
            assignTask: function assignTask(task) {
                this.task = task;
                this.processTask();
            },

            /**
             * @method awaitEvent
             * @param step {Object}
             * @return {void}
             */
            awaitEvent: function awaitEvent(step) {

                this.socket.on(step.event, _.bind(function eventReceived(data) {

                    // Iterate over each of the expected properties and their
                    // corresponding values.
                    for (var key in step.expect) {

                        // The usual suspect!
                        if (step.expect.hasOwnProperty(key)) {

                            console.log(step.expect[key] === data[key]);

                        }

                    }

                    // Continue the processing of the task.
                    this.processTask();

                }, this));

            },

            /**
             * Begin processing the task the client was given.
             *
             * @method processTask
             * @return {void}
             */
            processTask: function processTask() {

                do {

                    // Shift the first step from the task off of the array.
                    var step = this.task.shift();

                    if (step.type === 'on') {

                        // If the type is "on" then we need to wait for the server to
                        // send the event to us.
                        this.awaitEvent(step);
                        break;

                    }

                    console.log(step.event);

                    // Otherwise we can emit the event immediately.
                    this.socket.emit(step.event, step.with || {});

                } while (this.task.length);


            },

            /**
             * Assign events that can be broadcasted by the server, which could interrupt
             * any strategies currently being executed.
             *
             * @method setInterruptEvents
             * @param events
             * @return {void}
             */
            setInterruptEvents: function setInterruptEvents(events) {

            }

        };

        return ClientModel;

    }]);

})(window.tidalApp, window.io);