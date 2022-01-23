/* 
Request handlers (just like controller functions)
*/


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

            // Get the token from the headers
            var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            // Verify that the given token is valid for the current user's phone number
            handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
                if(tokenIsValid){
                    // Lookkup the user
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
                    callback(403, {'Error': 'Missing required token in header, or token is invalid'})
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
handlers._users.get = function(data,callback){
    // check if the queried phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && 
        data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){

        // Get the token from the headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the current user's phone number
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
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
                callback(403, {'Error': 'Missing required token in header, or token is invalid'})
            }
        });

    } else {
        callback(400, {'Error': 'Missing required field'});
    }
    
};

// users delete method
// Required data: phone
// optional data: none
// @TODO Cleanup (delete) any other data files associated with the user
handlers._users.delete = function(data,callback){
    //Check that the phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && 
        data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){

        // Get the token from the headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the current user's phone number
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
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
                callback(403, {'Error': 'Missing required token in header, or token is invalid'});
            }
        });

    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Tokens
handlers.tokens = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Opotional data: none
handlers._tokens.post = function(data,callback){
    var phone = typeof(data.payload.phone) == 'string' && 
                data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    var password = typeof(data.payload.password) == 'string' && 
                data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if(phone && password){
        // Look up the users who matches the phone number
        _data.read('users', phone, function(err, userData){
            if(!err && userData){
                // Hash the sent password and compare it with the user data password
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    // if valid create a token with a random name. set expiration date 1 hours in the futre
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    // Store the token 
                    _data.create('tokens',tokenId,tokenObject,function(err){
                        if(!err){
                            callback(200,tokenObject);
                        } else {
                            callback(500, {'Error': 'Could not generate the token'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'Password did not match the specified user\'s stored password'});
                }

            } else {
                callback(400, {'Error': 'Could not find the specified user'});
            }
        });
    } else{
        callback(400,{'Error': 'Missing required field(s)'})
    }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function(data,callback){
    // Check that the id is valid
    var tokenId = typeof(data.queryStringObject.id) == 'string' && 
        data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(tokenId){
        _data.read('tokens', tokenId, function(err, tokenData){
            if(!err && tokenData){
                callback(200,tokenData);
            } else {
                callback(404);
            }
        })
    } else{
        callback(400, {'Error': 'Missing required field(s)'})
    }
};

// Tokens - put
// Required data: id, extend
// Optiona data: none
handlers._tokens.put = function(data,callback){
    var id = typeof(data.payload.id) == 'string' && 
                data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if(id && extend){
        // Lookup the token 
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                // Check if the token isn't already expired
                if(tokenData.expires > Date.now()){
                    // Set expiration an hour from now
                    tokenData.expires += Date.now() +  1000 * 60 * 60;
                    
                    // Store the new updates
                    _data.update('tokens',id,tokenData,function(err){
                        if(!err){
                            callback(200);
                        } else {
                            callback(500, {'Error': 'Could not update the token\'s expiration'});
                        }   
                    });
                } else {
                    callback(400, {'Error': 'Token has already expired'});
                }
            } else {
                callback(400, {'Error': 'Specified token does not exist'});
            }
        }); 
    } else {
        callback(400, {'Error': 'Missing required fields(s) or field(s) are invalid'});
    }

};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function(data,callback){
    //Check that the phone number is valid
    var id = typeof(data.queryStringObject.id) == 'string' && 
        data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id){
        // Lookup the user
        _data.read('tokens',id,function(err,data){
            if(!err && data){
                _data.delete('tokens',id,function(err){
                    if(!err){
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete the specified token'});
                    }
                });
            } else {
                callback(404, {'Error': 'Could not find the specified token of the user'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id,phone,callback){
    // Look up the token
    _data.read('tokens',id,function(err,tokenData){
        console.log(id);
        if(!err && tokenData){
            // Check that the token is for the given user and has not expired
            if(tokenData.phone == phone && tokenData.expires > Date.now()){
                console.log("in true verify token");
                callback(true);
            } else {
                console.log("first cond : ", tokenData.phone == phone, "second cond : ", tokenData.expires > Date.now());
                callback(false);
            }
        } else {
            console.log("outer false");
            callback(false);
        }
    });
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