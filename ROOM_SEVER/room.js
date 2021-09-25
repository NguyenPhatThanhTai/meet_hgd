    const socket = io.connect('https://meet-hgd.herokuapp.com/');
    var interval;
    var id = '';
    var interval;
    // var canvas = document.createElement("canvas");
    const canvas = document.getElementById('fake');


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

    socket.on('screen-data', function(data) {
        if (data.id == id) {

        } else {
            $("img").attr("src", data.video);
            // drawCanvas(canvas, data.video);
        }
    })

    function takeSCreenShot() {
        const canIRun = navigator.mediaDevices.getDisplayMedia
        var stream = null;
        var interval;

        const takeScreenShot = async() => {
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'screen' },
            })

            return await new Promise(resolve => {
                interval = setInterval(() => {
                    gotMedia(stream);
                }, 100);
            });
        }

        function gotMedia(mediaStream) {
            const mediaStreamTrack = mediaStream.getVideoTracks()[0];
            var imageCapture = new ImageCapture(mediaStreamTrack);

            const canvas = document.getElementById('fake');
            const video = document.createElement('video');

            video.autoplay = true;
            video.srcObject = mediaStream;
            video.onplay = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

                socket.emit('screen-data', { id: id, video: canvas.toDataURL('image/webp', 0.5) });
            };
        }
        takeScreenShot();
    }

    function drawCanvas(canvas, img) {
        var myImg = new Image();
        var ctx4 = canvas.getContext("2d");
        myImg.onload = function() {
            // draw the image and scale it to the size of the canvas
            ctx4.drawImage(this,
                0, 0, this.width, this.height, /* source */
                0, 0, this.width, this.height); /* destination */
        }
        myImg.src = img;
        // canvas.width = getComputedStyle(canvas).width.split('px')[0];
        // canvas.height = getComputedStyle(canvas).height.split('px')[0];
        // let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        // let x = (canvas.width - img.width * ratio) / 2;
        // let y = (canvas.height - img.height * ratio) / 2;
        // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        // canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
        //     x, y, img.width * ratio, img.height * ratio);
    }