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

        $interval(function interval() {

            // Add a client!
            tidal.addClient().then(function then(response) {
                $scope.clients.push(response);
            });

        }, $scope.interval);

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