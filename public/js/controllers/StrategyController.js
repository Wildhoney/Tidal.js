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

        $http.get('../../strategies/strategies.conf').then(function (response) {

            // Find all of the available strategy files.
            var strategies = response.data.split(/,/ig);

            _.forEach(strategies, function forEach(strategy) {

                $http.get('../../strategies/' + strategy).then(function then(response) {

                    var index = (++$scope.index).toString(16);
                    $scope.strategies[index] = $yaml.load(response.data);
                    var first = $scope.strategies[index][0];

                    // It can only begin this strategy if it's an "on" event, otherwise it's part
                    // of a strategy that's based on the user initialisation, rather than the backend
                    // initialisation.
                    if (first.type !== 'on') {

                        if (typeof $scope.events[first.event] === 'undefined') {

                            // Initialise the namespace for this event.
                            $scope.events[first.event] = [];

                        }

                        // Push the index of the current event into the array.
                        $scope.events[first.event].push(index);

                    }

                });

            });

        });

    }]);

})(window.tidalApp, window.jsyaml);