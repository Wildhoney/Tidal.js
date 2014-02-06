(function() {

    var io   = require('socket.io-client'),
        http = require('http');

    /**
     * @property options
     * @type {Object}
     */
    var options = {
        remoteIp: '127.0.0.1',
        remotePort: 8888,
        localIp: '127.0.0.1',
        localPort: 7891
    };

    // Connect to the awaiting Socket.io server.
    io.connect('http://' + options.remoteIp + ':' + options.remotePort);

    http.createServer(function (request, result) {

        // ...

    }).listen(options.localPort, options.localIp);

})();