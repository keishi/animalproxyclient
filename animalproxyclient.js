const request = require('request');
const process = require('process');

const argv = require('yargs').usage('Usage: $0 <animal>').argv;

if (argv._.length == 0) {
    console.log(`Must specify an animal`);
    process.exit(1);
}

let animal = argv._[0];
console.log(`Connecting as ${animal}`);
var socket = require('socket.io-client')(`https://actionproxy.xpeg.org/${animal}`);
socket.on('connect', function(){
    console.log(`Connected as ${animal}`);
});
socket.on('error', function(err){
    console.log(`Error: ${err}`);
    process.exit(1);
});
socket.on('search', function(data, cb){
    console.log("search query:", data.query);
    request.get({
        url: "http://home.xpeg.org:8081/search",
        qs: {
            q: data.query
        },
        json: true
      }, (err, res, data) => {
        if (err) {
          console.log('Error:', err);
        } else if (res.statusCode !== 200) {
          console.log('Status:', res.statusCode);
        } else {
          // data is already parsed as JSON:
          console.log(data);
          if (data.length == 0) {
              cb("すみません、その質問の答えはわかりません。")
          } else {
            cb("その答えはズバリ！" + data[0][0]);
          }
        }
    });
});
socket.on('disconnect', function(reason){
    console.log(`Disconnected: ${reason}`);
});
