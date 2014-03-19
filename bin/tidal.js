(function() {

    "use strict";

    /**
     * @property options
     * @type {Object}
     */
    var options = {
        remoteSocket: '127.0.0.1:8888',
        localHttpPort: 7891,
        localSocketPort: 3001
    };

    var ioClient     = require('socket.io-client'),
        childProcess = require('child_process'),
        express      = require('express'),
        path         = require('path'),
        glob         = require('glob'),
        fs           = require('fs'),
        app          = express(),
        ioServer     = require('socket.io').listen(options.localSocketPort);

    ioServer.sockets.on('connection', function (socket) {

        socket.on('user/sign-in', function (options) {
            console.log(options);

            socket.emit('user/signed-in', { loggedIn: true });

        });

    });

    // Connect to the awaiting Socket.io server.
    ioClient.connect('http://' + options.remoteIp + ':' + options.remotePort);

    // Begin Express so the statistics are available from the `localPort`.
    app.use(express.static(__dirname + '/..'));
    app.listen(options.localHttpPort);

    glob(__dirname + '/../strategies/*.yaml', options, function (error, files) {

        var _files = [];

        files.forEach(function forEach(file) {
            file = path.basename(file);
            _files.push(file);
        });

        fs.writeFile(__dirname + '/../strategies/strategies.conf', _files.join(','));

        // Open the statistics in the new user's browser.
        childProcess.spawn('open', ['http://localhost:' + options.localHttpPort + '/public']);

    });

})();