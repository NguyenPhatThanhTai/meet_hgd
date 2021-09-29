const express = require("express");
const app = express();
const server = require("http").Server(app);
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

app.get("/", (req, rsp) => {
    rsp.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
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