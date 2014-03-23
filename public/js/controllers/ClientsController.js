(function($app) {

    "use strict";

    /**
     * @controller ClientsController
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.controller('ClientsController', ['$scope', '$timeout', 'Client',

    function clientsController($scope, $timeout, Client) {

        /**
         * @property clients
         * @type {Array}
         */
        $scope.clients = [];

        /**
         * @property concurrentConnections
         * @type {Number}
         */
        $scope.concurrentConnections = 10;

        /**
         * @property nextIterationMaximum
         * @type {Number}
         */
        $scope.nextIterationMaximum = 10000;

        /**
         * @property messages
         * @type {Array}
         */
        $scope.messages = [];

        /**
         * @property id
         * @type {Number}
         */
        $scope.sortProperty = 'id';

        /**
         * @property interval
         * @type {Number}
         */
        $scope.interval = 1500;

        // Invoked once all of the strategies have been loaded!
        $scope.$watch('isReady', function isReady(value) {

            if (value) {

                // Create a new client model, giving it a strategy to complete, and any events
                // that could defer that strategy.
                var client = new Client();
                client.assignStrategy($scope.pickStrategy());
                client.assignResponders($scope.events.on);

                // Add the new client into the array.
                $scope.clients.push(client);

            }

        });

        /**
         * @method receivedFeedback
         * @param event {Object}
         * @param feedback {Object}
         * @return {void}
         */
        $scope.receivedFeedback = function receivedFeedback(event, feedback) {

            feedback.date = new Date().getTime();

            // Find the partial that will output the message we're after.
            feedback.partial = 'partials/messages/' + feedback.type + '.html';

            $scope.messages.push(feedback);
            $scope.$apply();

        };

        // Various types of client feedback events.
        $scope.$on('client/invalid_property_value', $scope.receivedFeedback);
        $scope.$on('client/disconnected', $scope.receivedFeedback);
        $scope.$on('client/completed_strategy', function completedStrategy(event, feedback) {

            // Proxy the feedback.
            $scope.receivedFeedback(event, feedback);

            var client = feedback.client;

            $timeout(function timeout() {

                // Determine if the client should disconnect.
                if (Math.random() > 0.5) {
                    client.disconnect();
                    return;
                }

                // ...Otherwise we'll assign another strategy.
                client.assignStrategy($scope.pickStrategy());
                client.processStrategy();

            }, Math.random() * $scope.nextIterationMaximum);

        });

        /**
         * @method setOrder
         * @param property {String}
         * @return {void}
         */
        $scope.setOrder = function setOrder(property) {
            $scope.sortProperty = property;
        }

    }]);

})(window.tidalApp);