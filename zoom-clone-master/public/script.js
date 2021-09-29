const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer({
    path: "/peerjs",
    host: "/",
    port: "",
    secure: true,
    config: {
        'iceServers': [
            { url: 'stun:stun01.sipphone.com' },
            { url: 'stun:stun.ekiga.net' },
            { url: 'stun:stunserver.org' },
            { url: 'stun:stun.softjoys.com' },
            { url: 'stun:stun.voiparound.com' },
            { url: 'stun:stun.voipbuster.com' },
            { url: 'stun:stun.voipstunt.com' },
            { url: 'stun:stun.voxgratia.org' },
            { url: 'stun:stun.xten.com' },
            {
                url: 'turn:192.158.29.39:3478?transport=udp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            },
            {
                url: 'turn:192.158.29.39:3478?transport=tcp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            }
        ]
    },

    debug: 3
});

let myVideoStream;
let mySharedStream;
var userIdSend;

var getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
            call.answer(stream);
            var video = document.createElement("video");
            console.log("==========================" + call.metadata.type)
            if (call.metadata.type == "screensharing") {
                video.id = "stream-video";
            } else if (call.metadata.type == "stoppedscreen") {
                document.getElementById("stream-video").innerHTML = "";
            } else {
                video.id = "user-video";
            }

            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            connectToNewUser(userId, stream);
        });

        document.addEventListener("keydown", (e) => {
            if (e.which === 13 && chatInputBox.value != "") {
                socket.emit("message", chatInputBox.value);
                chatInputBox.value = "";
            }
        });

        socket.on("createMessage", (msg) => {
            console.log(msg);
            let li = document.createElement("li");
            li.innerHTML = msg;
            all_messages.append(li);
            main__chat__window.scrollTop = main__chat__window.scrollHeight;
        });
    });

peer.on("call", function(call) {
    var video = document.createElement("video");
    console.log("==========================" + call.metadata.type)
    if (call.metadata.type == "screensharing") {
        video.id = "stream-video";
    } else if (call.metadata.type == "stoppedscreen") {
        document.getElementById("stream-video").innerHTML = "";
    } else {
        video.id = "user-video";
    }
    getUserMedia({ video: true, audio: true },
        function(stream) {
            call.answer(stream); // Answer the call with an A/V stream.
            call.on("stream", function(remoteStream) {
                addVideoStream(video, remoteStream);
            });
        },
        function(err) {
            console.log("Failed to get local stream", err);
        }
    );
});

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id); //id ở đây là của peer tự tạo peer.id
    userIdSend = id;
    window.addEventListener('beforeunload', function(e) {
        socket.emit("user_leave", { "id": id, "room": ROOM_ID });
    })
});

// CHAT

const connectToNewUser = (userId, streams) => {
    var call = peer.call(userId, streams, {
        metadata: { "type": "user" }
    });
    console.log(call);
    var video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        console.log(userVideoStream);
        addVideoStream(video, userVideoStream);
    });
};

const addVideoStream = (videoEl, stream) => {
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", () => {
        videoEl.play();
    });

    if (videoEl.id == "stream-video") {
        document.getElementById("stream-video").append(videoEl)
    } else {
        videoGrid.append(videoEl);
    }
    let totalUsers = document.getElementsByTagName("video").length;
    // if (totalUsers > 1) {
    //     for (let index = 0; index < totalUsers; index++) {
    //         document.getElementsByTagName("video")[index].style.width =
    //             100 / totalUsers + "%";

    //         document.getElementsByTagName("video")[index].addEventListener("click", function() {
    //             this.style = "width: 1500px; height: 500px; display: block"
    //         });
    //     }
    // }
};

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

const sharedScreen = () => {
    var arrayUser;
    socket.emit("get_list", ROOM_ID);

    socket.on("list_user", (array) => {
        arrayUser = array
    });
    navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
    }).then((record) => {
        record.getVideoTracks()[0].onended = function() {
            console.log("stopped shared screen")
            document.getElementById("stream-video").innerHTML = "";
            arrayUser.forEach(function(current, index) {
                var call = peer.call(current, record, {
                    metadata: { "type": "stoppedscreen" }
                });
            })
        };

        arrayUser.forEach(function(current, index) {
            var video = document.createElement("video");
            video.id = "stream-video"
            addVideoStream(video, record);
            var call = peer.call(current, record, {
                metadata: { "type": "screensharing" }
            });
        })
    })
}

const setPlayVideo = () => {
    const html = `<i class="unmute fa fa-pause-circle"></i>
  <span class="unmute">Resume Video</span>`;
    document.getElementById("playPauseVideo").innerHTML = html;
};

const setStopVideo = () => {
    const html = `<i class=" fa fa-video-camera"></i>
  <span class="">Pause Video</span>`;
    document.getElementById("playPauseVideo").innerHTML = html;
};

const setUnmuteButton = () => {
    const html = `<i class="unmute fa fa-microphone-slash"></i>
  <span class="unmute">Unmute</span>`;
    document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
    const html = `<i class="fa fa-microphone"></i>
  <span>Mute</span>`;
    document.getElementById("muteButton").innerHTML = html;
};