(function() {

    var io           = require('socket.io-client'),
        childProcess = require('child_process'),
        express      = require('express'),
        app          = express();

    /**
     * @property options
     * @type {Object}
     */
    var options = {
        remoteIp:   '127.0.0.1',
        remotePort: 8888,
        localIp:    '127.0.0.1',
        localPort:  7891
    };

    // Connect to the awaiting Socket.io server.
    io.connect('http://' + options.remoteIp + ':' + options.remotePort);

    // Begin Express so the statistics are available from the `localPort`.
    app.use(express.static('../public'));
    app.listen(options.localPort);

    // Open the statistics in the new user's browser.
    childProcess.spawn('open', ['http://' + options.localIp + ':' + options.localPort]);

})();