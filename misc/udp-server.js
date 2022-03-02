/**
 * 
 * Example UDP Server
 * Creating a UDP datagram server listening on 6000
 * 
 */

//Dependencies
var dgram = require('dgram');

// Creating a server
var server = dgram.createSocket('udp4');

server.on('message', function(msgBuffer, sender){
    // Do something with an incoming message or do something with the sender
    var messageString = msgBuffer.toString();
    console.log(messageString);
});

// Bind to 6000
server.bind(6000);