/* 
Request handlers (just like controller functions)
*/

const { Z_DATA_ERROR } = require("zlib");

// dependencies
var _data = require('./data');
var helpers = require('./helpers');


//define handlers 
var handlers = {};

// Users
handlers.users = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data,callback);
    } else {
        callback(405);
    }
};

// container for the users submethods
handlers._users = {};

// users post method
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data,callback){
    //Check that all required fields are filled out
    var firstName = typeof(data.payload.firstName) == 'string' && 
                data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    
    var lastName = typeof(data.payload.lastName) == 'string' && 
                data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    
    var phone = typeof(data.payload.phone) == 'string' && 
                data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    var password = typeof(data.payload.password) == 'string' && 
                data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && 
                data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){
        // make sure user doesn't already exists from uniqueness of phone number
        _data.read('users',phone,function(err,data){
            if(err){
                // file does not exists and hence user should be created

                // Hash the password
                var hashedPassword = helpers.hash(password);
                if(hashedPassword){
                    //create the user object
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true,
                    };

                    //store the user
                    _data.create('users',phone,userObject,function(err){
                        if(!err){
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'User could not be created'});
                        }
                    });

                } else{
                    callback(500, {'Error': 'Could not hash the user\'s password'});
                }
                
            } else {
                // file doesn't exist that is user with the phone number already exists
                callback(400,{'Error':'A user  with that phone already exists'});
            }
        }); 
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
    
};

// users put method
// Required data: phone
// Optional data: firstName, lastName, password (atlease one must be specified)
// @TODO only let an authenticated user update their own.
handlers._users.put = function(data,callback){
    // check if the queried phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && 
        data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    
    // check for the optional fields
    var firstName = typeof(data.payload.firstName) == 'string' && 
                data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    
    var lastName = typeof(data.payload.lastName) == 'string' && 
                data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

    var password = typeof(data.payload.password) == 'string' && 
                data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    
    //error if the phone is invalid
    if(phone){
        //Error if nothing is sent to update
        if(firstName || lastName || password){
            _data.read('users',phone,function(err,userData){
                if(!err && userData){
                    // update the necessary fields
                    if(firstName){
                        userData.firstName = firstName;
                    }

                    if(lastName){
                        userData.lastName = lastName;
                    }

                    if(password){
                        userData.hashedPassword = helpers.hash(password);
                    }

                    _data.update('users',phone,userData,function(err){
                        if(!err){
                            callback(200);
                        } else{
                            callback(500, {'Error': 'Could not update the details for specified user'});
                        }
                    })
                } else {
                    callback(400,{'Error': 'Specified user does not exist'});
                }
            });
        } else {
            callback(400,{'Error': 'Missing fields to update'});
        }

    } else {
        callback(400,{'Error': 'Missing required field'})
    }
};

// users get method
// Required data: none
// optional data: none
// @TODO   only let authenticated user access their object. Dont let them access anyone else's object
handlers._users.get = function(data,callback){
    // check if the queried phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && 
        data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        // Lookup the user
        _data.read('users',phone,function(err,data){
            if(!err && data){
                // remove the hashed password from user obj before returning into requester
                delete data.hashedPassword;
                callback(200,data);  
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
    
};

// users delete method
// Required data: phone
// optional data: none
// @TODO only let authenticated user delete their object and not anyone else's
// @TODO Cleanup (delete) any other data files associated with the user
handlers._users.delete = function(data,callback){
    //Check that the phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && 
        data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        // Lookup the user
        _data.read('users',phone,function(err,data){
            if(!err && data){
                _data.delete('users',phone,function(err){
                    if(!err){
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete the specified user'});
                    }
                });
            } else {
                callback(404, {'Error': 'Could not find the specified user'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// ping handler
handlers.ping = function(data, callback){
    // callback a http status code, and a payload object
    callback(200);
};

// not found handler
handlers.notFound = function(data, callback){
    callback(404);
};

// export the handlers
module.exports = handlers;