/**
 * @module Tidal
 * @submodule Strategies
 * @author Adam Timberlake
 */
(function TidalStrategies() {

    "use strict";

    var glob = require('glob');

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
         * @return {Array}
         */
        fetchAll: function fetchAll() {

            glob(__dirname + '/../strategies/*.yaml', function (error, files) {

                var _files = [];

                files.forEach(function forEach(file) {
                    file = path.basename(file);
                    _files.push(file);
                });

            });

        }

    };


    module.exports = new Strategies();

})();