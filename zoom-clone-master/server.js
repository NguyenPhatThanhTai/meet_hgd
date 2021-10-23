const express = require("express");
const app = express();
const fs = require("fs");
const server = require("http").Server(app);
var request = require('request');
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const arrayConnected = [];
// Peer

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
    allow_discovery: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/call", (req, rsp) => {
    rsp.redirect(`/call/${uuidv4()}`);
});

app.get("/call/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});

app.get("/videoURL", function(req, res) {
    // var fileUrl = 'https://ia601402.us.archive.org/35/items/KSCNMD-S2-09-720/Kobayashi-san%20Chi%20no%20Maid%20Dragon%20S2%20-%2009.720.ia.mp4';
    var fileUrl = req.query.url;

    var range = req.headers.range;
    var positions, start, end, total, chunksize;

    // HEAD request for file metadata
    request({
        url: fileUrl,
        method: 'HEAD'
    }, function(error, response, body) {
        setResponseHeaders(response.headers);
        pipeToResponse();
    });

    function setResponseHeaders(headers) {
        positions = range.replace(/bytes=/, "").split("-");
        start = parseInt(positions[0], 10);
        total = headers['content-length'];
        end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        chunksize = end - start + 1;

        res.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4"
        });
    }

    function pipeToResponse() {
        var options = {
            url: fileUrl,
            headers: {
                range: "bytes=" + start + "-" + end,
                connection: 'keep-alive'
            }
        };

        request(options).pipe(res);
    }
});

app.get("/video", function(req, res) {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }

    const videoPath = "video/titan.mp4";
    const videoSize = fs.statSync("video/titan.mp4").size;

    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, { start, end });

    videoStream.pipe(res);
});

io.on("connection", (socket) => {
    socket.on("join-room", async(roomId, userId) => {
        socket.join(roomId);
        //add to list

        await addToList(roomId, userId);

        socket.to(roomId).broadcast.emit("user-connected", userId);
        // socket.to(roomId).broadcast.emit("list_of_user", arrayConnected);

        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message);
        });

        socket.on("get_list", async(id) => {
            io.to(roomId).emit("list_user", await getList(id));
        })

        socket.on("user_leave", (data) => {
            console.log("User " + data.id + " Leave");
            arrayConnected.forEach(function(current, index) {
                if (current.id == data.room) {
                    const check = current.list.indexOf(data.id);
                    if (check > -1) {
                        current.list.splice(check, 1);
                        if (current.list.length == 0) {
                            arrayConnected.splice(current, 1);
                        }
                    }
                }
            })
            console.log(arrayConnected);
        })
    });
});

async function addToList(room, user) {
    if (arrayConnected.length > 0) {
        arrayConnected.forEach(function(current, index) {
            console.log("Vo day 1")
            if (current.id == room) {
                console.log("Vo day 2")
                current.list.push(user);
            } else {
                console.log("Vo day 3")
                var obj = {};
                obj["list"] = [user];
                obj["id"] = room;
                arrayConnected.push(obj);
            }
        })
    } else {
        console.log("Vo day 4")
        var obj = {};
        obj["list"] = [user];
        obj["id"] = room;
        arrayConnected.push(obj);
    }

    console.log(arrayConnected);
}

async function getList(room) {
    var obj;
    arrayConnected.forEach(function(current, index) {
        if (current.id == room) {
            obj = current.list;
            console.log(obj);
        } else {
            obj = null;
        }
    })
    return obj;
}

server.listen(process.env.PORT || 80);