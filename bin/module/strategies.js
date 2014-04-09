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
    function Strategies() {
        this.here = 'hee';
    }

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

            glob(__dirname + '/../../strategies/*.yaml', function (error, files) {

                var strategies = [];

                files.forEach(function forEach(file) {
                    var name = path.basename(file);
                    strategies[name] = yaml.safeLoad(fs.readFileSync(file, 'utf8'))
                });

                deferred.resolve(strategies);

            });

            return deferred.promise;

        }

    };


    module.exports = new Strategies();

})();