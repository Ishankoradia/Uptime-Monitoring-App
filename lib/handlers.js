/* 
Request handlers (just like controller functions)
*/


// dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');


//define handlers 
var handlers = {};


/**
 * 
 * HTML handlers
 * 
 */

// Index handler
handlers.index = function(data, callback){
    // Reject any request that isn't a get
    if(data.method == 'get') {

        // Prepare data string interpolation
        var templateData = {
            'head.title': 'Uptime Monitoring',
            'head.description': 'Free simple monitoring for hhtp/https sites. We will let you know if your site goes down through a text',
            'body.class': 'Index'
        }


        // Read in a template as a string
        helpers.getTemplate('index', templateData,function(err, str){
            if(!err && str) {
                // Add the universal templates headers and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str){
                    if(!err && str){
                        // Return that page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                })
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// Create Account
handlers.accountCreate = function(data, callback) {
    // Reject any request that isn't a get
    if(data.method == 'get') {

        // Prepare data string interpolation
        var templateData = {
            'head.title': 'Create Account',
            'head.description': 'Sign up is easy and only take a few seconds',
            'body.class': 'accountCreate'
        }


        // Read in a template as a string
        helpers.getTemplate('accountCreate', templateData,function(err, str){
            if(!err && str) {
                // Add the universal templates headers and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str){
                    if(!err && str){
                        // Return that page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                })
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }    
};

// Create New Session
handlers.sessionCreate = function(data, callback) {
    // Reject any request that isn't a get
    if(data.method == 'get') {

        // Prepare data string interpolation
        var templateData = {
            'head.title': 'Login to your Account',
            'head.description': 'Please enter your phone and password to access your account',
            'body.class': 'sessionCreate'
        }


        // Read in a template as a string
        helpers.getTemplate('sessionCreate', templateData,function(err, str){
            if(!err && str) {
                // Add the universal templates headers and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str){
                    if(!err && str){
                        // Return that page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                })
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }    
};

// Session has been deleted
handlers.sessionDeleted = function(data, callback) {
    // Reject any request that isn't a get
    if(data.method == 'get') {

        // Prepare data string interpolation
        var templateData = {
            'head.title': 'Logged Out',
            'head.description': 'You have been logged out of your account',
            'body.class': 'sessionDeleted'
        }


        // Read in a template as a string
        helpers.getTemplate('sessionDeleted', templateData,function(err, str){
            if(!err && str) {
                // Add the universal templates headers and footer
                helpers.addUniversalTemplates(str, templateData, function(err, str){
                    if(!err && str){
                        // Return that page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                })
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }    
};


// Favicon
handlers.favicon = function(data, callback){
    if(data.method == 'get') {
        // Read in the favicon's data
        helpers.getStaticAsset('favicon.ico', function(err, data){
            if(!err && data) {
                // Callback the data
                callback(200, data, 'favicon');
            } else {
                callback(500)
            }
        });
    } else {
        callback(405);
    }
};

// Public assets
handlers.public = function(data, callback){
    if(data.method == 'get') {
        // Get the filename being requested
        var trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
        if(trimmedAssetName.length > 0){            
            // Read in the asset
            helpers.getStaticAsset(trimmedAssetName, function(err, data){
                if(!err && data) {
                    // Determine the content type (default to plain text)
                    var contentType = 'plain';

                    if(trimmedAssetName.indexOf('.css') > -1){
                        contentType = 'css';
                    }

                    if(trimmedAssetName.indexOf('.png') > -1){
                        contentType = 'png';
                    }

                    if(trimmedAssetName.indexOf('.jpg') > -1){
                        contentType = 'jpg';
                    }

                    if(trimmedAssetName.indexOf('.ico') > -1){
                        contentType = 'favicon';
                    }


                    callback(200, data, contentType);
                } else {
                    callback(404)
                }
            });
        } else {

        }

        
    } else {
        callback(405);
    }
};




/**
 * 
 * JSON API handlers 
 * k 
 */

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
                _data.read('users',phone,function(err,userData){
                    if(!err && userData){
                        _data.delete('users',phone,function(err){
                            if(!err){
                                // Delete each of the check associated with the user
                                var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                var checksToDelete = userChecks.length;
                                if(checksToDelete > 0){
                                    var checksDeleted = 0;
                                    var deletionErrors = false;
                                    // Loop through the checks
                                    userChecks.forEach(checkId => {
                                        // delete the checks
                                        _data.delete('checks', checkId, function(err){
                                            if(err){
                                                deletionErrors = true;
                                            }
                                            checksDeleted ++ ;

                                            if(checksDeleted == checksToDelete){
                                                if(!deletionErrors){
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error': 'Errors while deleteing all of the user\'s checks , all checks may not have been delete form the system successfully'});
                                                }
                                            }
                                        });
                                    });

                                } else {
                                    callback(200);
                                }
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
        if(!err && tokenData){
            // Check that the token is for the given user and has not expired
            if(tokenData.phone == phone && tokenData.expires > Date.now()){
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Checks
handlers.checks = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._checks[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Container for all the checks method
handlers._checks = {};

// Checks - Post
// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data: none
handlers._checks.post = function(data,callback){
    // Validate inputs 
    var protocol = typeof(data.payload.protocol) == 'string' && 
                ['http', 'https'].indexOf(data.payload.protocol.trim()) > -1 ? data.payload.protocol.trim() : false;
    var url = typeof(data.payload.url) == 'string' && 
                data.payload.url.trim().length > 0 ? data.payload.url : false;
    var method = typeof(data.payload.method) == 'string' && 
                ['get', 'post', 'put', 'delete'].indexOf(data.payload.method.trim()) > -1 ? data.payload.method.trim() : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && 
                data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
    var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && 
                data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        // Get the token from the headers 
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Lookup the user
        _data.read('tokens',token,function(err,tokenData){
            if(!err && tokenData){
                var userPhone = tokenData.phone;

                // Lookup user data
                _data.read('users',userPhone,function(err,userData){
                    if(!err && userData){
                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        // verify that the user has less than no of max checks per user from config.js
                        if(userChecks.length < config.maxChecks){
                            // Create a random id for check
                            var checkId = helpers.createRandomString(20);

                            // Create the check object and include user's phone
                            var checkObject = {
                                'id': checkId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                                'timeoutSeconds': timeoutSeconds
                            };

                            // Save the check object
                            _data.create('checks', checkId, checkObject, function(err){
                                if(!err){
                                    // Add the checkId to the users object
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    // Save the new user data
                                    _data.update('users', userPhone, userData, function(err){
                                        if(!err){
                                            // Return the data about the new check
                                            callback(200, checkObject);
                                        } else {
                                            callback(500, {'Error': 'Could not update the user with the new check'});
                                        }
                                    });
                                } else {
                                    callback(500, {'Error': 'Could not create the new check'});
                                }
                            });

                        } else {
                            callback(400,{'Error': 'The user already has the maximum number of checks '+config.maxChecks});
                        }
                    } else {
                        callback(403)
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required inputs or inputs are invalid'});
    }
};

//Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = function(data,callback){
    // Check that the id is valid
    var id = typeof(data.queryStringObject.id) == 'string' && 
        data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id){

        // Lookup the check to get the user
        _data.read('checks', id, function(err,checkData){
            if(!err && checkData){
                
                // Get the token from the headers
                var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                // Verify that the give token belongs to the user who created the check in query
                handlers._tokens.verifyToken(token,checkData.userPhone,function(tokenIsValid){
                    if(tokenIsValid){
                        // Return the checkdata
                        callback(200, checkData);
                    } else {
                        callback(403, {'Error': 'Missing required token in headers or token is invalid'});
                    }
                });
            } else {
                callback(404);
            }
        });

        
    } else{
        callback(400, {'Error': 'Missing required field(s)'})
    }
};

// Checks - put 
// Required data : id
// Optional data : protocol or url or method or successCodes or timeoutSeonds  (atleast one)
handlers._checks.put = function(data,callback){
    var id = typeof(data.queryStringObject.id) == 'string' && 
        data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    
    var protocol = typeof(data.payload.protocol) == 'string' && 
        ['http', 'https'].indexOf(data.payload.protocol.trim()) > -1 ? data.payload.protocol.trim() : false;
    var url = typeof(data.payload.url) == 'string' && 
            data.payload.url.trim().length > 0 ? data.payload.url : false;
    var method = typeof(data.payload.method) == 'string' && 
            ['get', 'post', 'put', 'delete'].indexOf(data.payload.method.trim()) > -1 ? data.payload.method.trim() : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && 
            data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
    var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && 
            data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if(id){
        // Check to make sure if one of the optional fields has beens ent
        if(protocol || url || method || successCodes || timeoutSeconds){
            // Lookup the checks
            _data.read('checks', id, function(err, checkData){
                if(!err && checkData){
                    // Get the token from headers
                    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                    // Verify that the given token is valid and belongs to the user who create the token
                    handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid){
                        if(tokenIsValid){
                            // update the check
                            if(protocol){
                                checkData.protocol = protocol;
                            } 

                            if(url){
                                checkData.url = url;
                            }

                            if(method){
                                checkData.method = method;
                            }

                            if(successCodes){
                                checkData.successCodes = successCodes;
                            }

                            if(timeoutSeconds){
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            // Store the new updates of the check
                            _data.update('checks',id,checkData,function(err){
                                if(!err){
                                    callback(200);
                                } else {
                                    callback(500, {'Error': 'Could not update the check'});
                                }
                            });
                            
                        } else {
                            callback(403);
                        }
                    });


                } else {
                    callback(400, {'Error': 'Check ID does not exist'});                }
            });

        } else {
            callback(400, {'Error': 'Missing fields to update'});
        }
    } else {    
        callback(400, {'Error': 'Missing required field'});
    }

};

//Check - delete
// Required data: id
handlers._checks.delete = function(data,callback){
    //Check that the phone number is valid
    var id = typeof(data.queryStringObject.id) == 'string' && 
        data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id){

        // Lookup the check
        _data.read('checks',id,function(err,checkData){
            if(!err && checkData){
                // Get the token from the headers
                var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                // Verify that the given token is valid for the current user's phone number
                handlers._tokens.verifyToken(token,checkData.userPhone,function(tokenIsValid){
                    if(tokenIsValid){

                        // Delete the check data
                        _data.delete('checks',id,function(err){
                            if(!err){
                                // Lookup the user
                                _data.read('users',checkData.userPhone,function(err,userData){
                                    if(!err && userData){
                                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                        // Remove the delete check from their list of checks
                                        var checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition, 1);
                                            //Re-svae the user's data
                                            _data.update('users', checkData.userPhone, userData, function(err){
                                                if(!err){
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error': 'Could not update the user'});
                                                }
                                            });
                                        } else {
                                            callback(500, {'Error': 'Could not find the check on user\'s check list'})
                                        }   

                                        callback(200);                                            
                                        
                                    } else {
                                        callback(404, {'Error': 'Could not find the user who created the check'});
                                    }
                                });

                            } else {
                                callback(500, {'Error': 'Could not delete the check data'});
                            }
                        });

                        
                    } else {
                        callback(403, {'Error': 'Missing required token in header, or token is invalid'});
                    }
                });
            } else {
                callback(400, {'Error': 'Specified check id does not exist'});
            }
        });

        

    } else {
        callback(400, {'Error': 'Missing required field'});
    }
}


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