/*
helper functions for our various tasks
*/

// dependencies
var crypto = require('crypto');
var config = require('./config');
var https = require('https');

var helpers = {};

// create a SHA256 hash
helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

// Parse a Json string to an object in all cases without throwing exceptions
helpers.parseJsonToObject = function(str){
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (error) {
        return {};
    }
}

// create a string of random alpa-num chars 
helpers.createRandomString = function(strLen){
    strLen = typeof(strLen) == 'number' && strLen > 0 ? strLen : false;
    if(strLen){
        // define all the possible characters that could go into the string
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        //start the final string
        var str = '';
        for(i = 1; i <= strLen; i++){
            // get a random char from the possible string
            var randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

            str += randomChar;
        }

        // Return the final string
        return str;
    } else {
        return false;
    }
};

// Send an SMS via twilio
helpers.sendTwilioSms = function(phone, msg, callback){
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length <= 1699 ? msg.trim() : false;
    if(msg && phone){
        // Configure the request payload
        var payload = {
            'From': config.twilio.fromPhone,
            'To': '+91' + phone,
            'Body': msg
        };

        // Stringify the payload
        var stringPayload = new URLSearchParams(payload).toString();

        // Configure the request details
        var requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            'auth': config.twilio.accountSid+':'+config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        }

        // Instantiate the request object
        var req = https.request(requestDetails, function(res){
            // Grab the status of the sent request
            var status = res.statusCode;

            if(status == 200 || status == 201){
                callback(false);
            } else {
                callback('Status code returned was '+status);
            }
        });

        // Bind to the erro event so it deson't get thrown
        req.on('error', function(e){
            callback(e);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();

    } else {
        callback('Given parameters were missing or invalid');
    }
};


module.exports = helpers;

