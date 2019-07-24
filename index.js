const express = require('express');
const http = require('http');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const app = express();
const server = http.createServer(app);


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

process.on('uncaughtException', function (err) {
    log.error('未知异常', err)
});
let options = `ffmpeg -f avfoundation -framerate 30 -video_size 1280x720 -i "0:0" \
-codec:v mpeg1video -s 640x360 -r 30 -b:v 1500k -bf 0 \
-codec:a mp2 -b:a 128k -f mpegts http://127.0.0.1:8081/stream`

app.get('/', async function(req, res) {
    if(req.query){
        let result = await ffmpegStreamStart(options);
        res.send(JSON.stringify(result));
    } else{
        
    }
    return 0;
})

const isProd = process.env.NODE_ENV === 'production'
process.env.HOST = '127.0.0.1'
process.env.PORT = isProd ? 4000 : 5000

server.listen(process.env.PORT, process.env.HOST)

console.log(
  `Server is listening on http://${process.env.HOST}:${process.env.PORT}`
)

async function ffmpegStreamStart(options){
    try{
        const {
            error,
            stdout,
            stderr
        } = await exec(options);
        if (!error && !stderr && stdout){
            return true;
        }
        return false;
    } catch(error){
        return false;
    }
}
