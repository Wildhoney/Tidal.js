/**
 * @module Tidal
 * @submodule Strategies
 * @author Adam Timberlake
 */
(function TidalStrategies() {

    "use strict";

    var glob = require('glob'),
        path = require('path'),
        fs   = require('fs'),
        yaml = require('js-yaml'),
        q    = require('q');

    /**
     * @class Strategies
     * @constructor
     */
    function Strategies() {}

    /**
     * @property prototype
     * @type {Object}
     */
    Strategies.prototype = {

        /**
         * @method fetchAll
         * @return {q.promise}
         */
        fetchAll: function fetchAll() {

            var deferred = q.defer();

            glob(__dirname + '/../../strategies/pagination.yaml', function (error, files) {

                var strategies = [];

                files.forEach(function forEach(file) {

                    var strategy = yaml.safeLoad(fs.readFileSync(file, 'utf8'));

                    if (!strategy.name) {
                        // Assume the name is the filename if one hasn't been set.
                        strategy.name = path.basename(file);
                    }

                    strategies.push(strategy);

                });

                deferred.resolve(strategies);

            });

            return deferred.promise;

        }

    };

    module.exports = new Strategies();

})();