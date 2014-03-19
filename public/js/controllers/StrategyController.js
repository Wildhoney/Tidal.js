(function($app, $yaml) {

    /**
     * @controller StrategyController
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.controller('StrategyController', ['$scope', '$http',

    function strategyController($scope, $http) {

        $http.get('../../strategies/login.yaml').then(function then(response) {

            $scope.strategies = $yaml.load(response.data);
            console.log($scope.strategies);

        });

    }]);

})(window.tidalApp, window.jsyaml);