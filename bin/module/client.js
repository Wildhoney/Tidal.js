/**
 * @module Tidal
 * @submodule Client
 * @author Adam Timberlake
 */
(function TidalClient() {

    "use strict";

    var io = require('socket.io-client');

    /**
     * @class Client
     * @constructor
     */
    function Client() {}

    /**
     * @property prototype
     * @type {Object}
     */
    Client.prototype = {

        /**
         * @property strategies
         * @type {Array}
         */
        strategies: [],

        /**
         * @property socket
         * @type {Object}
         */
        socket: {},

        /**
         * @method establishConnection
         * @param url {String}
         * @return {Object}
         */
        establishConnection: function establishConnection(url) {
            this.socket = io.connect(url, {'force new connection': true});
            return this.socket;
        },

        /**
         * @method addStrategy
         * @param strategy {Object}
         * @return {void}
         */
        addStrategy: function addStrategy(strategy) {
            console.log(strategy);
            this.strategies.push(strategy);
        }

    };

    module.exports = Client;

})();