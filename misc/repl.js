/**
 * 
 *  Example REPL server
 *  Take in the word "fizz" and log out "buzz"
 * 
 */


// Dependencies
var repl = require('repl');

// Start the repl
repl.start({
    'prompt' : '>',
    'eval' : function(str){
        // Evalutation function
        console.log("At the evaluation stage: ",str);    

        // If the user said fizz, say buzz back to them
        if(str.indexOf('fizz') > -1){
            console.log('buzz');
        }
    }
});