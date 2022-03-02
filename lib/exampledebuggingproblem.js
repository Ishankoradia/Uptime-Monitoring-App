/**
 * 
 * Library that demonstrates something and throws error when its init() method is called 
 * 
 */

// Container
var example = {};



// Init function
example.init = function(){
    // This is an error created intentionally
    var foo = bar;
};


// export
module.exports = example;