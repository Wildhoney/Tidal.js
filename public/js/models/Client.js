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
            },

            /**
             * Assign events that can be broadcasted by the server, which could interrupt
             * any strategies currently being executed.
             *
             * @method setInterruptEvents
             * @param events
             */
            setInterruptEvents: function setInterruptEvents(events) {

            }

        };

        return ClientModel;

    }]);

})(window.tidalApp, window.io);