(function($app, $yaml) {

    /**
     * @controller StrategyController
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.controller('StrategyController', ['$scope', '$http',

    function strategyController($scope, $http) {

        /**
         * @property strategies
         * @type {Object}
         */
        $scope.strategies = {};

        /**
         * @property events
         * @type {Array}
         */
        $scope.events = [];

        /**
         * @property index
         * @type {Number}
         * @default 1000
         */
        $scope.index = 1000;

        $http.get('../../strategies/login.yaml').then(function then(response) {

            var index = (++$scope.index).toString(16);
            $scope.strategies[index] = $yaml.load(response.data);
            var first = $scope.strategies[index][0];

            // It can only begin this strategy if it's an "on" event, otherwise it's part
            // of a strategy that's based on the user initialisation, rather than the backend
            // initialisation.
            if (first.type === 'on') {
                $scope.events[first.event] = index;
            }

        });

    }]);

})(window.tidalApp, window.jsyaml);