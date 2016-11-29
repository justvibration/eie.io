# eie.io
aws hack
FTW

# Socket.IO

## Built-in Events

1. Connection:
```javascript 
io.sockets.on('connection', function (socket...
```
2. Message: 
```javascript 
socket.on('message', function (data) { ...
```
3. Disconnect: 
```javascript 
socket.on('disconnect', function () { ...
```

## Messages
1. Single Socket (eg. "hello X and welcome to the chat room"):
```javascript 
socket.emit('message', data);
```
2. All Sockets
```javascript 
io.sockets.emit('message', data);
```
3. A "Room":
```javascript 
io.sockets.in('room').emit('message', data);
```


# References

Socket.io - Binding the front and back-end together with Node.js and Canvas: 
```
https://www.youtube.com/watch?v=qmvxytWVBJ4
```
