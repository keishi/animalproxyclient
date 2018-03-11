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
socket.on('action', function(data, cb){
    console.log("action query:", data.query);
    request.get({
        url: "http://localhost:8081/action",
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
          cb(data['textToSpeech']);
        }
    });
});
socket.on('disconnect', function(reason){
    console.log(`Disconnected: ${reason}`);
});
