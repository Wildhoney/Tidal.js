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
//        glob         = require('glob'),
        app          = express();
                       require('socket.io').listen(options.localSocketPort);

    // Connect to the awaiting Socket.io server.
    ioClient.connect('http://' + options.remoteIp + ':' + options.remotePort);

    // Begin Express so the statistics are available from the `localPort`.
    app.use(express.static(__dirname + '/../public'));
    app.listen(options.localHttpPort);

    // Open the statistics in the new user's browser.
    childProcess.spawn('open', ['http://localhost:' + options.localHttpPort]);

})();