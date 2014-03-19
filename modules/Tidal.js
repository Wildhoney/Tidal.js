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
         * @property responders
         * @type {Array}
         */
        responders: [],

        /**
         * @method _assert
         * @param condition {Boolean|Number|Text}
         * @param message {String}
         * @return {void}
         * @private
         */
        _assert: function _assert(condition, message) {

            if (!condition) {
                throw 'Tidal.js: ' + message;
            }

        },

        /**
         * Start the whole process of mimicking actual users using our WebSocket environment.
         *
         * @method start
         * @return {void}
         */
        start: function start() {

        },

        /**
         * @method addResponder
         * @param options {Object}
         * @return {void}
         */
        addResponder: function addResponder(options) {

            // Necessities!
            this._assert(options.on, 'You missed the `on` declaration!');
            this._assert(options.respond, 'You missed the `respond` declaration!');

            // Looking good...
            this.responders.push(options);

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