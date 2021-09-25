    const socket = io.connect('https://meet-hgd.herokuapp.com/room');
    var interval;
    var id = '';
    // var screenshot;
    // var screenshot = require('screenshot-desktop');
    var interval;
    var canvas = document.createElement("canvas");
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
        // interval = setInterval(function() {
        //     screenshot().then((img) => {
        //         var imgStr = new Buffer(img).toString('base64');
        //         io.to(id).emit('screen-data', imgStr);
        //     })
        // }, 100)
    })

    socket.on('screen-data', function(data) {
        // const canvas = document.getElementById('fake');
        // const video = document.createElement('video');

        // video.autoplay = true;
        // video.srcObject = data;

        // canvas.width = video.videoWidth;
        // canvas.height = video.videoHeight;

        // canvas.getContext('2d').drawImage(data.video, 0, 0, data.videoWidth, data.videoHeight);
        // const canvas = document.querySelector('#fake');
        // drawCanvas(canvas, data.video);
        if (data.id == id) {

        } else {
            $("img").attr("src", data.video);
        }

        // console.log(data.video)
    })

    // function startShareScreen() {
    //     socket.emit("screen-data", (id));
    // }

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
                }, 200);
            });

            // // get correct video track
            // const track = stream.getVideoTracks()[0]
            //     // init Image Capture and not Video stream
            // const imageCapture = new ImageCapture(track)
            //     // take first frame only
            // const bitmap = await imageCapture.grabFrame()
            //     // destory video track to prevent more recording / mem leak
            // track.stop()

            // const canvas = document.getElementById('fake')
            //     // this could be a document.createElement('canvas') if you want
            //     // draw weird image type to canvas so we can get a useful image
            // canvas.width = bitmap.width
            // canvas.height = bitmap.height
            // const context = canvas.getContext('2d')
            // context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height)
            //     // const image = canvas.toDataURL()

            // // this turns the base 64 string to a [File] object
            // const res = await fetch(image)
            // const buff = await res.arrayBuffer()
            //     // clone so we can rename, and put into array for easy proccessing
            // const file = [
            //     new File([buff], `photo_${new Date()}.jpg`, {
            //         type: 'image/jpeg',
            //     }),
            // ]
            // return file
        }

        function gotMedia(mediaStream) {
            const mediaStreamTrack = mediaStream.getVideoTracks()[0];
            var imageCapture = new ImageCapture(mediaStreamTrack);

            // imageCapture.grabFrame()
            //     .then(imageBitmap => {
            //         // const canvas = document.querySelector('#fake');
            //         // drawCanvas(canvas, imageBitmap);
            //         canvas.width = imageBitmap.width;
            //         canvas.height = imageBitmap.height;
            //         var ctx = canvas.getContext("2d");
            //         ctx.drawImage(imageBitmap, 0, 0);
            //         var dataURL = canvas.toDataURL();
            //         socket.emit('screen-data', {
            //             id: id,
            //             video: dataURL
            //         });
            //     })
            //     .catch(error => console.log(error));

            const canvas = document.getElementById('fake');
            const video = document.createElement('video');

            video.autoplay = true;
            video.srcObject = mediaStream;
            video.onplay = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

                // console.log(canvas.toDataURL());

                socket.emit('screen-data', { id: id, video: canvas.toDataURL('image/jpeg', 0.1) });
            };
        }

        // const button = document.getElementById('cake').onclick = () => canIRun ? takeScreenShot() : {}
        takeScreenShot();
    }

    function drawCanvas(canvas, img) {
        canvas.width = getComputedStyle(canvas).width.split('px')[0];
        canvas.height = getComputedStyle(canvas).height.split('px')[0];
        let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        let x = (canvas.width - img.width * ratio) / 2;
        let y = (canvas.height - img.height * ratio) / 2;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
            x, y, img.width * ratio, img.height * ratio);
    }