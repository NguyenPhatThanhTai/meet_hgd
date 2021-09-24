    const socket = io.connect('https://meet-hgd.herokuapp.com/');
    var interval;
    var id = '';
    var screenshot;
    // const screenshot = require('screenshot-desktop');
    // requirejs(["screenshot-desktop"], function(screenshot) {
    //     //This function is called when scripts/helper/util.js is loaded.
    //     //If util.js calls define(), then this function is not fired until
    //     //util's dependencies have loaded, and the util argument will hold
    //     //the module value for "helper/util".
    // });


    getRoomId();

    function getRoomId() {
        var room = prompt("Please enter room id to connect", "Harry Potter");
        if (room != '') {
            socket.emit('join', room);
            id = room;
        } else {
            getRoomId();
        }
    }

    socket.on('chat', function(data) {
        alert(data.mess);
    })

    socket.on('screen-data', function(message) {
        $("img").attr("src", "data:image/png;base64," + message);
    })

    function startShareScreen() {
        socket.emit("screen-data", (id));
    }