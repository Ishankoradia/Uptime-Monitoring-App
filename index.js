/*
Primary file for API
*/

// dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');


// instantiating the HTTP server
var httpServer = http.createServer(function(req,res) {
    unifiedServer(req, res);
});

// start the http server
httpServer.listen(config.httpPort, function(){
    console.log("The server is listening on port "+config.httpPort+" in "+config.envName+" mode");
});

// instantiating the HTTPS server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req,res) {
    unifiedServer(req, res);
});

// start the http server
httpsServer.listen(config.httpsPort, function(){
    console.log("The server is listening on port "+config.httpsPort+" in "+config.envName+" mode");
});


// unified server for http and https
var unifiedServer = function(req, res){
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
        var choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ?
             router[trimmedPath] : handlers.notFound;

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

            console.log('we are returning this response : ', statusCode, payloadString);
        });

    });    

}


// define a request router
var router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
}