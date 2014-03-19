(function($app) {

    "use strict";

    /**
     * @controller ApplicationController
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.controller('ApplicationController', ['$scope',

    function applicationController($scope) {

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