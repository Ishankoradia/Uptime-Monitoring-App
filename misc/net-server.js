/**
 * 
 * Example TCP(Net) Server
 * Listen to port 6000 and sends the word 'pong' to client
 * 
 */

// Dependencies
var net = require('net');


// Create the server
var server = net.createServer(function(connect){
    // Send the work "pong"
    var outboundMessage = "pong";
    connect.write(outboundMessage);

    // When the client writes something, log it out
    connect.on('data', function(inboundMessage){
        var messageString = inboundMessage.toString();
        console.log("I wrote "+outboundMessage+" and they said "+inboundMessage);
    });
});


server.listen(6000);