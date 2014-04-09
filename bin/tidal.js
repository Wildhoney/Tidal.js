(function() {

    "use strict";

    var yaml = require('js-yaml'),
        io   = require('socket.io-client'),
        path = require('path'),
        glob = require('glob'),
        fs   = require('fs');

    var config = yaml.safeLoad(fs.readFileSync(__dirname + '/tidal.yaml', 'utf8'));

    console.log(config);

//    // Connect to the awaiting Socket.io server.
//    ioClient.connect('http://' + options.remoteIp + ':' + options.remotePort);
//
//    // Begin Express so the statistics are available from the `localPort`.
//    app.use(express.static(__dirname + '/..'));
//    app.listen(options.localHttpPort);
//
//    glob(__dirname + '/../strategies/*.yaml', options, function (error, files) {
//
//var _files = [];
//
//files.forEach(function forEach(file) {
//    file = path.basename(file);
//    _files.push(file);
//});
//
//fs.writeFile(__dirname + '/../strategies/strategies.conf', _files.join(','));
//
//// Open the statistics in the new user's browser.
//childProcess.spawn('open', ['http://localhost:' + options.localHttpPort + '/public']);
//
//    });

})();