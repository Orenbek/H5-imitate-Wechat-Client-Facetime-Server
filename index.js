const express = require('express');
const http = require('http');
const exec = require('child_process').exec;
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
let option1 = `ffmpeg -f avfoundation -framerate 30 -video_size 1280x720 -i "0:0" \
-codec:v mpeg1video -s 640x360 -r 30 -b:v 1500k -bf 0 \
-codec:a mp2 -b:a 128k -f mpegts http://127.0.0.1:8081/stream`
//音视频聊天
let option2 = `ffmpeg -f avfoundation -framerate 30 -video_size 1280x720 -i "1:0" \
-codec:v mpeg1video -s 640x360 -r 30 -b:v 1500k -bf 0 \
-codec:a mp2 -b:a 128k -f mpegts http://127.0.0.1:8081/stream`
//录屏及录音聊天
let childProcess;
app.get('/', function(req, res) {
    if(req.query.run==='1'&&!childProcess){
        ffmpegStreamStart(option1);
        res.send(JSON.stringify({status: 'running'}));
    } else if(req.query.run==='2'&&!childProcess){
        ffmpegStreamStart(option2);
        res.send(JSON.stringify({status: 'running'}));
    } else{
        if(childProcess){
            childProcess.kill();
            childProcess = undefined;
            res.send(JSON.stringify({status: 'stoped'}));
            return;
        }
        res.send(JSON.stringify({status: 'break'}));
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

function ffmpegStreamStart(option){
    childProcess = exec(option , function(err, stdout,stderr){
        console.log('error is ',err,'\nstdout is ',stdout,'\n stderr is ',stderr);
    });
}
