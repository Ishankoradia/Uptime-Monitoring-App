/*
*
* Server - related tasks
*
*/ 


// dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');
var util = require('util');
var debug = util.debuglog('servers');


// Instantiate the server module object
var server = {};


// instantiating the HTTP server
server.httpServer = http.createServer(function(req,res) {
    server.unifiedServer(req, res);
});


// instantiating the HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req,res) {
    server.unifiedServer(req, res);
});


// unified server for http and https
server.unifiedServer = function(req, res){
    // get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    // get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // get the query string as an object
    var queryStringObject = parsedUrl.query;

    // get the http method
    var method = req.method.toLowerCase();

    // get the headers as an object
    var headers = req.headers;

    // get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });
    req.on('end', function(){
        buffer += decoder.end();

        // choose the handler this request goes to.
        var choosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ?
             server.router[trimmedPath] : handlers.notFound;

        //construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };
        
        // route the request to the choosen handler
        choosenHandler(data,function(statusCode, payload){
            // use the status code called back by the handler, else define it as 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // use the payload called back by the handler else define it as empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // if the response is 200, print green otherwise red
            if(statusCode == 200){
                debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
            } else {
                debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
            }   
            //debug('we are returning this response : ', statusCode, payloadString);
        });

    });    

}


// define a request router
server.router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
}

// Init script
server.init = function(){    
    // start the http server
    server.httpServer.listen(config.httpPort, function(){
        console.log('\x1b[36m%s\x1b[0m', 'Background workers are running '+config.httpPort+' in '+config.envName+' mode');
    });


    // start the https server
    server.httpsServer.listen(config.httpsPort, function(){
        console.log('\x1b[35m%s\x1b[0m', 'Background workers are running '+config.httpsPort+' in '+config.envName+' mode');
    });

}


// Export the server
module.exports = server;