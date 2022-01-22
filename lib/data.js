/* 
Library for storing and editing data
*/

// dependencies
var fs = require('fs');
var path = require('path');
const helpers = require('./helpers');

// container for the module (to be exported)
var lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname,'/../.data/')

// write data to a file
lib.create = function(dir, file, data, callback){
    // open the file for writing. fd is the file descriptor
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err, fd){
        if(!err && fd){
            // convert data into string
            var stringData = JSON.stringify(data);

            // write to file
            fs.writeFile(fd,stringData,function(err){
                if(!err){
                    fs.close(fd,function(err){
                        if(!err){
                            callback(false);
                        } else {
                            callback('Error closing the new file in creation');
                        }
                    })
                } else {
                    callback('Error writing to new file');
                }
            })
        } else{
            callback('Could not create a new file, it may already exists.');
        }
    });
};

// read data from a file
lib.read = function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8',function(err,data){
        if(!err && data){
            var parsedData = helpers.parseJsonToObject(data);
            callback(false,parsedData);
        } else{
            callback(err,data);
        }
    });
}


// update an existing file with new data
lib.update = function(dir,file,data,callback){
    // open the file for reading
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fd){
        if(!err && fd){
            // convert dat(a to string
            var stringData = JSON.stringify(data);

            // truncate the contents of the file 
            fs.ftruncate(fd,function(err){
                if(!err){
                    fs.writeFile(fd,stringData,function(err){
                        if(!err){
                            fs.close(fd,function(err){
                                if(!err){
                                    callback(false);
                                } else {
                                    callback('there was an err closing the file');
                                }
                            });
                        } else {
                            callback('Err writing to the same file');
                        }
                    }); 
                } else {    
                    callback('Error truncating the file');
                }
            });
        } else {
            callback('Could not open the file for update, it may not exist yet.')
        }
    });
}

//delete a file 
lib.delete = function(dir,file,callback){
    // unlink 
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
        if(!err){
            callback(false)
        } else{
            callback('Error deleting the file, it may not exist');
        }
    });
};

// export the module
module.exports = lib;