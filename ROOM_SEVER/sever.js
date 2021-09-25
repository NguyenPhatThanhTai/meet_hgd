const express = require("express");
const app = express();
app.use(express.static(__dirname));
const http = require('http');
const fs = require("fs");
var request = require('request');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const screenshot = require("screenshot-desktop");
var pathToModule = require.resolve('screenshot-desktop');
var interval;
console.log(pathToModule.toString('base64'));

app.get("/room", function(req, res) {
    res.sendFile(__dirname + '/room.html')
});

io.on('connection', (socket) => {

    socket.on('join', (id) => {
        socket.join("123");
        io.in("123").emit('chat', { 'mess': 'User Joined', 'screenshot': screenshot() });
    })

    socket.on("screen-data", function(data) {
        // console.log(data.video)
        io.to("123").emit('screen-data', data);
    })
})

server.listen(process.env.PORT || 5000, () => {
    console.log('listening on *:5000');
});