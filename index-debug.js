/*
Primary file for API
*/


// Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');
var exampleDebugginPb = require('./lib/exampledebuggingproblem');

// Declare the app
var app = {};

// Init function
app.init = function(){
    // Start the server
    debugger;
    server.init();
    debugger;

    // Start the workers
    debugger;
    workers.init();
    debugger;

    // Start the CLI, but make sure it starts last
    debugger;
    setTimeout(function(){
        cli.init();
    }, 50)
    debugger;

    // Set foo at 1
    debugger;
    var foo = 1;
    console.log("Just assigned 1 to foo");
    debugger;

    // Increment
    foo++;
    console.log("Just incremented foo");
    debugger;

    // Square foo
    foo = foo * foo;
    console.log("Just squared foo");
    debugger;

    // Convert foo to a string
    foo = foo.toString();
    console.log("Just converted to stirng foo");
    debugger;
    
    // Call the init script that will throw error
    exampleDebugginPb.init();
    console.log("Just called the library");
    debugger;
};

//Execute
app.init();



// Export
module.exports = app;
