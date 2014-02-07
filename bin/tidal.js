(function() {

    var io      = require('socket.io-client'),
        express = require('express'),
        app     = express();

    /**
     * @property options
     * @type {Object}
     */
    var options = {
        remoteIp:   '127.0.0.1',
        remotePort: 8888,
        localPort:  7891
    };

    // Connect to the awaiting Socket.io server.
    io.connect('http://' + options.remoteIp + ':' + options.remotePort);

    // Begin Express so the statistics are available from the `localPort`.
    app.use(express.static(__dirname + '/public'));
    app.listen(options.localPort);

})();