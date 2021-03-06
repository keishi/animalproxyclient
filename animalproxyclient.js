#!/usr/bin/env node

"use strict";

const request = require('request');
const process = require('process');

let port = process.env.WPSEARCH_PORT ? parseInt(process.env.WPSEARCH_PORT) : 8081;
const argv = require('yargs')
    .usage('$0 <animal> [port]', 'start the proxy client', (yargs) => {
        yargs.positional('animal', {
            describe: 'the animal id',
            type: 'string'
        }).positional('port', {
            describe: 'the port number to forward the requests to',
            default: port,
            type: 'number'
        });
    }).argv;

let animal = argv.animal;
port = argv.port;
console.log(`Connecting as ${animal}`);
console.log(`Forwarding to http://localhost:${port}/action`);
var socket = require('socket.io-client')(`http://35.231.100.105/${animal}`);
socket.on('connect', function () {
    console.log(`Connected as ${animal}`);
});
socket.on('error', function (err) {
    console.log(`Error: ${err}`);
    process.exit(1);
});
socket.on('action', function (data, cb) {
    console.log("action query:", data.query);
    request.get({
        url: `http://localhost:${port}/action`,
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
socket.on('disconnect', function (reason) {
    console.log(`Disconnected: ${reason}`);
});
