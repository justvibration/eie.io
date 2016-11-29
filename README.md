# eie.io
aws hack
FTW

# Guide to Project Setup
1. Create new Node project (package.json)
2. Download node dependencies (socket.io, express)
3. Create app.js-file that runs socket.io on express http server and serves a index.html file
4. In app.js, set up socket.io with handlers for connection, sending and receiving messages
5.


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
4. Volatile Messages (if not important, less overhead)
```javascript 
io.sockets('observers').volatile.emit('message', data);
```

## Rooms (organize sockets into rooms)
1. Join
```javascript
socket.join('players');
```
1. Leave
```javascript
socket.leave('players');
```

### References

#### Socket.io - Binding the front and back-end together with Node.js and Canvas: 
```
https://www.youtube.com/watch?v=qmvxytWVBJ4
```
#### Canvas Platformer Game
```
http://www.somethinghitme.com/2013/01/09/creating-a-canvas-platformer-tutorial-part-one/
```
