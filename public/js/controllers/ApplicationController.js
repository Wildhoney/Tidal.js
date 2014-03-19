(function($app) {

    /**
     * @controller ApplicationController
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.controller('ApplicationController', ['$scope', '$interval', 'tidal',

    function applicationController($scope, $interval, tidal) {

        /**
         * @property isReady
         * @type {Boolean}
         */
        $scope.isReady = false;

        /**
         * @method setReady
         * @return {void}
         */
        $scope.setReady = function setReady() {
            $scope.isReady = true;
        }

    }]);

})(window.tidalApp);