(function($app) {

    "use strict";

    /**
     * @controller ClientsController
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.controller('ClientsController', ['$scope', '$interval', 'tidal', 'ClientModel',

    function clientsController($scope, $interval, tidal, ClientModel) {

        /**
         * @property clients
         * @type {Array}
         */
        $scope.clients = [];

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

                tidal.addClient().then(function then(model) {

                    // Create a new client model, giving it a task to complete, and any events
                    // that could interrupt that event.
                    var client = new ClientModel(model);
                    client.assignStrategy($scope.pickStrategy());
//                    client.setInterruptEvents($scope.events.on);

                });

            }

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