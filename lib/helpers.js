/*
helper functions for our various tasks
*/

// dependencies
var crypto = require('crypto');
var config = require('./config');

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


module.exports = helpers;

