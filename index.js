const express = require('express');
const http = require('http');
const exec = require('child_process').exec;
const app = express();
const server = http.createServer(app);
const FSServerURL = 'http://127.0.0.1:8001/'
const option1 = `ffmpeg -f avfoundation -framerate 30 -video_size 1280x720 -i "0:none" \
-codec:v mpeg1video -s 640x360 -r 30 -b:v 1500k -bf 0 -muxdelay 0.001 \
-f mpegts ${FSServerURL}`
//视频聊天

const option2 = `ffmpeg -f avfoundation -framerate 30 -video_size 1280x720 -i "1:0" \
-codec:v mpeg1video -s 640x360 -r 30 -b:v 1500k -bf 0 \
-codec:a mp2 -b:a 128k -f mpegts ${FSServerURL}`
//录屏及录音聊天
const soption = `ffmpeg -f avfoundation -i "none:0" \
-codec:a mp2 -b:a 128k -muxdelay 0.001 -f mpegts ${FSServerURL}`
//音频跟视频一起录制 音频出现较大的延迟，因此决定使用双线程分别采集音频和视频数据。效果相当明显。

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

process.on('uncaughtException', function (err) {
    log.error('未知异常', err)
});
let childProcess1,childProcess2;
app.get('/', function(req, res) {
    if(req.query.run==='1'&&!childProcess1&&!childProcess2){
        ffmpegStreamStart(option1,soption);
        res.send(JSON.stringify({status: 'running'}));
    } else if(req.query.run==='2'&&!childProcess1&&!childProcess2){
        ffmpegStreamStart(option2,soption);
        res.send(JSON.stringify({status: 'running'}));
    } else{
        if(childProcess1||childProcess2){
            childProcess1.kill();
            // childProcess2.kill();
            childProcess1 = undefined;
            childProcess2 = undefined;
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

function ffmpegStreamStart(voption,soption){
    childProcess1 = exec(voption , function(err, stdout,stderr){
        console.log('error is ',err,'\nstdout is ',stdout,'\n stderr is ',stderr);
    });
    childProcess2 = exec(soption , function(err, stdout,stderr){
        console.log('error is ',err,'\nstdout is ',stdout,'\n stderr is ',stderr);
    });
}
