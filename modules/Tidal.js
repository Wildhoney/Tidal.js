(function($window) {

    /**
     * @module Tidal
     * @author Adam Timberlake
     * @link http://github.com/Wildhoney/Tidal.js
     * @constructor
     */
    function Tidal() { }

    /**
     * @property prototype
     * @type {Object}
     */
    Tidal.prototype = {

        /**
         * @method _assert
         * @param condition {Boolean|Number|Text}
         * @param message {String}
         * @return {void}
         * @private
         */
        _assert: function _assert(condition, message) {

            if (!condition) {
                throw message;
            }

        },

        /**
         * @method addResponder
         * @param options {Object}
         * @return {void}
         */
        addResponder: function addResponder(options) {



        },

        /**
         * @method addStrategy
         * @param options {Object}
         * @return {void}
         */
        addStrategy: function addStrategy(options) {

        }

    };

    $window.tidal = new Tidal();

})(window);