(function($app) {

    "use strict";

    /**
     * @controller ClientsController
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.controller('ClientsController', ['$scope', '$interval', 'Client',

    function clientsController($scope, $interval, Client) {

        /**
         * @property clients
         * @type {Array}
         */
        $scope.clients = [];

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

            // Find the partial that will output the message we're after.
            feedback.partial = 'partials/messages/' + feedback.type + '.html';

            $scope.messages.push(feedback);
            $scope.$apply();

        };

        // Various types of client feedback events.
        $scope.$on('client/invalid_property_value', $scope.receivedFeedback);
        $scope.$on('client/completed_strategy', $scope.receivedFeedback);

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