/**
 * 
 * Example TLS(tls) Server
 * Listen to port 6000 and sends the word 'pong' to client
 * 
 */

// Dependencies
var tls = require('tls');
var fs = require('fs');
var path = require('path');

// Server options
var options = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

// Create the server
var server = tls.createServer(options, function(connect){
    // Send the work "pong"
    var outboundMessage = "pong";
    connect.write(outboundMessage);

    // When the client writes something, log it out
    connect.on('data', function(inboundMessage){
        var messageString = inboundMessage.toString();
        console.log("I wrote "+outboundMessage+" and they said "+messageString);
    });
});


server.listen(6000);