(function($app, $yaml) {

    /**
     * @controller StrategyController
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.controller('StrategyController', ['$scope', '$http', '$q',

    function strategyController($scope, $http, $q) {
        /**
         * @property strategies
         * @type {Object}
         */
        $scope.strategies = { length: 0 };

        /**
         * @property events
         * @type {Object}
         */
        $scope.events = { on: [], emit: [] };

        /**
         * @property path
         * @type {String}
         */
        $scope.path = '../../strategies/';

        /**
         * @property index
         * @type {Number}
         * @default 1000
         */
        $scope.index = 1000;

        // Read the YAML strategies from the configuration file which is generated by the
        // Node.js client.
        $http.get($scope.path + 'strategies.conf', {}).then(function (response) {

            // Find all of the available strategy files.
            var strategies = response.data.split(/,/ig),
                promises   = [];

            _.forEach(strategies, function forEach(strategy) {

                // Create the promise.
                var deferred = $q.defer();
                promises.push(deferred.promise);

                // Load the strategy, which will resolve the promise.
                $scope.loadStrategy(strategy, deferred);

            });

            // Resolve when we've loaded all of the required strategies.
            $q.all(promises).then(function then() {
                $scope.setReady();
            });

        });

        /**
         * @method loadStrategy
         * @param strategy {Object}
         * @param deferred {Object}
         * @return {void}
         */
        $scope.loadStrategy = function loadStrategy(strategy, deferred) {

            $http.get($scope.path + strategy, {}).then(function then(response) {

                // Update the `length` property of the object.
                $scope.strategies.length++;

                // Determine its index, and find the first strategy.
                var index = (++$scope.index).toString(16);
                $scope.strategies[index] = $yaml.load(response.data);
                var first = $scope.strategies[index][0];

                // Add the event to the list so that a client can choose one.
                if (typeof $scope.events[first.type][first.event] === 'undefined') {

                    // Initialise the namespace for this event.
                    $scope.events[first.type][first.event] = [];

                }

                // Push the index of the first event into the array.
                $scope.events[first.type][first.event].push(index);

                // Resolve the promise!
                deferred.resolve();

            });

        };

    }]);

})(window.tidalApp, window.jsyaml);