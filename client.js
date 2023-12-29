#!/usr/bin/node
const prompt = require('prompt-sync')({sigint: false});
const net = require('net');
const fs = require('fs');

var client = new net.Socket(), server = (process.argv[2] || " : "), transferSize;

while (true) {
    try {
        server = server.split(':');
        client.connect({ host: server[0], port: parseInt(server[1]) });
        break;
    } catch (error) {
        console.log("Cannot connect to " + server[0]);
    }
    server = prompt("Server to connect to -> ");
}

function transferFile() {
    console.log("Input absolute directory of file to transfer, /EXIT to cancel");
    var file = prompt(">_");
    if (file == "/EXIT") {
        console.log("Exiting...");
        client.destroy();
        process.exit();
    }
    fs.readFile(file, async (error, data) => {
        if (error) {
            console.log("[ERROR]: Could not transfer file " + file);
            transferFile();
        }
        console.log(`Transferring file of ${data.length} bytes`);
        transferSize = data.length;
        client.write(data);
    });
}

client.on('data', data => {
    var dataArray = data.toString('utf8').split(','), dataSize = 0;
    for (let i = 0; i < dataArray.length - 1; i++) {
        dataSize += parseInt(dataArray[i]);
    }
    transferSize -= dataSize;
    if (!dataSize) { return; }
    if (transferSize <= 0) {
        client.write(">END_FILE_TRANSFER".toString("utf8"));
        console.log("Finished transfer!");
        transferFile();
    }
})

client.on('connect', () => {
    console.log(`Connected to server as ${client.remoteAddress}:${client.remotePort}`);
    client.write(">DUMMY_MESSAGE".toString('utf8'));
    transferFile();
})