(function($app) {

    /**
     * @controller ClientsController
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.controller('ClientsController', ['$scope', '$interval', 'tidal',

    function clientsController($scope, $interval, tidal) {

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
                    $scope.clients.push(model);
                    model.task = $scope.pickStrategy();
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