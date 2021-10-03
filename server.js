const NodeMediaServer = require('node-media-server');
require('dotenv').config();
const axios = require('axios');

async function checkSessionShit({id, args, streamPath}){
  // check here and return false if you want to reject
  let data = {
    name: streamPath.split('/').pop(),
    auth: args.auth,
    id
  }
  console.log(data)
  const sleep = ()=>new Promise(async (res, rej)=>{
    axios.post('https://api.brime.tv/v1/account/stream_auth', data).then(function (response) {
      if(response.status === 200){
        return res('yey')
      }
    })
    .catch(function (error) {
      rej('err')
    });
    // setTimeout(()=>{
    //   if(Math.random() < 0.65){
    //     return res('yey')
    //   }
    //   rej('err')
    // }, 250)
  })

  try{
    await sleep()
    return true
  }catch(err){
    return false
  }
}

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 20000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
    auth_callback: checkSessionShit
  },
  relay: {
    ffmpeg: '/usr/local/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        mode: 'push',
        edge: process.env.TRANSCODER_IP,
      }
    ]
  },
  http: {
    port: 8000,
    allow_origin: '*'
  }
};

var nms = new NodeMediaServer(config)

nms.run();
nms.on('preConnect', (id, args) => {
  // console.log('[IngestEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('prePublish', async (id, StreamPath, args) => {
  const body = {
    "ingest_id": id,
    "timestamp": Date.now(),
    "region": process.env.region,
    "server_ip": process.env.server_ip,
    "channel": StreamPath.replace('/live/', ''),
    "submitted_key": args.auth
  }
  axios.post('https://api.brime.tv/v1/streams/webhook/on_publish', body)
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[IngestEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[IngestEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  const body = {
    "ingest_id": id,
    "timestamp": Date.now(),
    "channel": StreamPath.replace('/live/', ''),
  }
  axios.post('https://api.brime.tv/v1/streams/webhook/on_publish_done', body)
});