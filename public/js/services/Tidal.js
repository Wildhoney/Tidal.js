(function($app) {

    "use strict";

    /**
     * @service Tidal
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     */
    $app.service('tidal', ['$q', '$http', function tidalService($q, $http) {

        var service = {};

        /**
         * @property index
         * @type {Number}
         */
        service.index = 1;

        /**
         * @method addClient
         * @return {$q.promise}
         */
        service.addClient = function addClient() {

            var deferred = $q.defer();

            // Fetch a random user to impersonate real people.
            $http.get('http://api.randomuser.me/', {}).then(function (response) {
                deferred.resolve({ id: service.index++, user: response.data.results[0].user });
            });

            return deferred.promise;
        };

        return service;

    }]);

})(window.tidalApp);