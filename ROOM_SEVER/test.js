window.screenshot = require("screenshot-desktop");
setInterval(function() {
    screenshot().then((img) => {
        var imgStr = new Buffer(img).toString('base64');
        // io.to(id).emit('screen-data', imgStr);
    })
}, 100)