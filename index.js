var express = require("express"),
    app = require("express")(),
    server = require('http').createServer(app),
    io = require("socket.io").listen(server),
    connections = 0;

server.listen(9966);

app.use(express.static(__dirname + "/public"));

io.sockets.on('connection', function (socket) {
    connections++;
    socket.emit('client connected', connections);

    socket.on('left', function(speed) {
        socket.broadcast.emit('left', -speed);
    });
    
    socket.on('right', function(speed) {
        socket.broadcast.emit('right', speed);
    });
    
    socket.on('up', function(speed) {
        socket.broadcast.emit('up', -speed);
    });
    
    socket.on('down', function(speed) {
        socket.broadcast.emit('down', speed);
    });
    
    socket.on('render style', function(style) {
        socket.broadcast.emit('render style', style);
    });
    
    socket.on('disconnect', function (socket) {
        connections--;
        io.sockets.emit('client disconnected', connections);
    });
});
