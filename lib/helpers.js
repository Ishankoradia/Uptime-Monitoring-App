/*
helper functions for our various tasks
*/

// dependencies
var crypto = require('crypto');
var config = require('./config');
var https = require('https');
var path = require('path');
var fs = require('fs');

var helpers = {};

// Sample for testing , returns a number
helpers.getANumber = function(){
    return 1;
}

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


// Get the string content of a template
helpers.getTemplate = function(templateName, data, callback) {
    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) == 'object' && data !== null ? data : {};
    if(templateName) {
        var templateDir = path.join(__dirname, '/../templates/');
        fs.readFile(templateDir+templateName+'.html', 'utf-8', function(err,str){
            if(!err && str && str.length > 0) {
                // Do interpolation on the string
                var finalString = helpers.interpolate(str, data);
                callback(false, finalString);
            } else {
                callback('No template could be found');
            }
        });
    } else {
        callback('A valid template name was not specified');
    }
};


// Add the universal header and footer to a string, and pass provided data object to the header and footer for interpolation
helpers.addUniversalTemplates = function(str, data, callback){
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};
    // Get the header 
    helpers.getTemplate('_header', data, function(err, headerString){
        if(!err && headerString) {
            // Get the footer
            helpers.getTemplate('_footer', data, function(err, footerString){
                if(!err && footerString) {
                    // Add them all together
                    var fullString = headerString + str + footerString;
                    callback(false, fullString);
                } else {
                    callback('Could not find the footer template');
                }
            });
        } else {
            callback('Could not find the header template')
        }
    });

};


// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = function(str, data){
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};

    // Add the templateGlobals to the data objects, prepending their key name with "global"
    for (var keyName in config.templateGlobals) {
        if(config.templateGlobals.hasOwnProperty(keyName)){
            data['global.'+keyName] = config.templateGlobals[keyName];
        }
    }


    // For each key in the data object , insert its value into the string at the corresponding key name
    for(var key in data){
        if(data.hasOwnProperty(key) && typeof(data[key]) == 'string'){
            var replace = data[key];
            var find = '{'+key+'}';
            str = str.replace(find, replace);
        }
    }


    return str;
}


// Get contents of a static (public) asset
helpers.getStaticAsset = function(fileName, callback){
    fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
    if(fileName) {
        var publicDir = path.join(__dirname, '/../public/');
        fs.readFile(publicDir+fileName, function(err, data){
            if(!err && data) {
                callback(false, data);
            } else {
                callback("No file could be found");
            }
        });
    }
};









module.exports = helpers;

