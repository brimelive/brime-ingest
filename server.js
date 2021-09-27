const NodeMediaServer = require('node-media-server');
require('dotenv').config()

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 20000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  relay: {
  ffmpeg: '/usr/local/bin/ffmpeg',
  tasks: [
    {
      app: 'live',
      mode: 'push',
      edge: 'rtmp://10.1.0.148:8000/edge',
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

nms.on('postConnect', (id, args) => {
  console.log('[IngestEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  console.log('[IngestEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
let body = {
    "ingest_id": id,
    "region": process.env.region,
    "server_ip": process.env.server_ip,
    "channel": StreamPath.replace('/live/',''),
    "submitted_key": args.auth
}
console.log(body)
 // let session = nms.getSession(id);
 //session.reject();
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[IngestEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[IngestEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('prePlay', (id, StreamPath, args) => {
  console.log('[IngestEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postPlay', (id, StreamPath, args) => {
  console.log('[IngestEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePlay', (id, StreamPath, args) => {
  console.log('[IngestEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});