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
console.log(pathToModule);

app.get("/room", function(req, res) {
    res.sendFile(__dirname + '/room.html')
});

io.on('connection', (socket) => {

    socket.on('join', (id) => {
        socket.join(id);
        io.in(id).emit('chat', { 'mess': 'User Joined', 'screenshot': screenshot });
    })

    socket.on("screen-data", function(id) {
        interval = setInterval(function() {
            screenshot().then((img) => {
                var imgStr = new Buffer(img).toString('base64');
                io.to(id).emit('screen-data', imgStr);
            })
        }, 100)
    })
})


server.listen(process.env.PORT || 5000, () => {
    console.log('listening on *:5000');
});