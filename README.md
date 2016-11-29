# eie.io
aws hack
FTW

# Socket.IO

## Built-in Events

1. Connection:
io.sockets.on('connection', function (socket...
2. Message: 
socket.on('message', function (data) { ...
3. Disconnect: 
socket.on('disconnect', function () { ...

## Messages
1. Single Socket (eg. "hello X and welcome to the chat room"):
socket.emit('message', data);
2. All Sockets
io.sockets.emit('message', data);
3. A "Room":
io.sockets.in('room').emit('message', data);


# References

Socket.io - Binding the front and back-end together with Node.js and Canvas: 
https://www.youtube.com/watch?v=qmvxytWVBJ4
