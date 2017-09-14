function mouseDown(key) {
    console.log(key, ': ', 'down', 'for user: ', playerId);
    socket.emit('movement', {
        id: playerId,
        key: key,
        type: 'down'
    })
}

function mouseUp(key) {
    console.log(key, ': ', 'up ', 'for user: ', playerId);
    socket.emit('movement', {
        id: playerId,
        key: key,
        type: 'up'
    })
}