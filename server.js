// dependencies
var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

// routing: server
app.get('/server', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/', express.static(__dirname + '/'));
/*
app.get('/client', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/', express.static(__dirname + '/client'));*/

app.get('/controller', function (req, res) {
    res.sendFile(__dirname + '/client/controller.html');
});

app.use('/controller', express.static(__dirname + '/controller'));

// init server
var port = 2000;
server.listen(port, function () {
    console.log('server listens on port: ' + port + '...');
})

// socket io
var SOCKET_LIST = [];
var PLAYER_LIST = [];
var SERVER_SOCKET;
var INITIALIZED = false;

io.sockets.on('connection', onConnection);

function onConnection(socket) {
    if (!INITIALIZED) {
        SERVER_SOCKET = socket;
        INITIALIZED = true;
        console.log('server joined the game');
    } else {
        SOCKET_LIST[socket.id] = socket;
        console.log('player joined the game');
    }

    socket.emit('register', {
        id: socket.id
    });

    // socket.on('disconnect', onDisconnect);
    socket.on('movement', function (data) {
        SERVER_SOCKET.emit('render', {
            key: data.key,
            type: data.type
        })
    });
};

function onDisconnect(data) {
    console.log('player left the game');
}