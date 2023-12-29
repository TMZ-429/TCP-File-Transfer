#!/usr/bin/node
const prompt = require('prompt-sync')({sigint: false});
const net = require('net');
const fs = require('fs');
var port, endFile = false, fileName;

port = 59898;

const server = net.createServer(socket => {
    socket.on('data', data => {
        let message = data.toString('utf8');
        if (message == ">DUMMY_MESSAGE") {
            console.log(`Dummy message received from ${socket.remoteAddress}:${socket.remotePort}`);
            return;
        } if (message == ">END_FILE_TRANSFER") {
            endFile = false;
            console.log("Finished!");
            return;
        } if (!endFile) {
            console.log(`Data received from ${socket.remoteAddress}:${socket.remotePort}, input file name`);
            fileName = prompt('>_');
        }
        fs.writeFileSync(fileName, data, {flag: "a"});
        //We separate the sizes by commas because there used to be this error where if we send TCP messages too fast, they can bunch up into the same message, which can cause like 2861 byte output
        //& 6122 byte output to bunch up into 28616122 byte output, which severely skews calculating if the download is done and can lead to file corruption by sending unfinished files (Especially when sending binaries)
        socket.write(String(data.length) + ",");
        endFile = true;
    });
    socket.on('connect', () => {
        console.log(`${socket.remoteAddress}:${socket.remotePort} connected`);
    });
    socket.on('end', () => {
        console.log(`${socket.remoteAddress}:${socket.remotePort} disconnected`);
    });
});


server.maxConnections = 1;
server.listen(port);
