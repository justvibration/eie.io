// socket
var socket = io();

var playerId;

socket.on('register', onRegister);

function onRegister (data) {
    playerId = data.id;
    
    socket.emit('accept', {
        id: playerId,
        agent: 'client'
    })
}