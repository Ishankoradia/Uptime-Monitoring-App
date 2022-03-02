/**
 * 
 * This is the test runner
 * 
 */


// Override the NODE_ENV variable
process.env.NODE_ENV = 'testing';

// Application logic for test runner
_app = {};

// Container for the tests
_app.tests = {};

// Add on the unit tests
_app.tests.unit = require('./unit');
_app.tests.api = require('./api');

// Count all the tests
_app.countTests = function(){
    var counter = 0;
    for(var key in _app.tests){
        if(_app.tests.hasOwnProperty(key)){
            var subTests = _app.tests[key];
            for(var testName in subTests){
                if(subTests.hasOwnProperty(testName)){
                    counter++;
                }
            }
        }
    }
    return counter;
};


// Run all the tests, collecting errors and successes
_app.runTests = function(){
    var errors = [];
    var successes = 0;
    var limit = _app.countTests();
    var counter = 0;
    for(var key in _app.tests){
        if(_app.tests.hasOwnProperty(key)){
            var subTests = _app.tests[key];
            for(var testName in subTests){
                if(subTests.hasOwnProperty(testName)){
                    (function(){
                        var tmpTestName = testName;
                        var testValue = subTests[testName];
                        // Call the test
                        try {
                            testValue(function(){
                                // If it calls back without throwing then it has succeeded, log it gree
                                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                                counter++;
                                successes++;
                                if(counter == limit){
                                    _app.produceTestReport(limit, successes, errors);
                                }; 
                            });
                        } catch (e) {
                            // Log it in red
                            errors.push({
                                'name': tmpTestName,
                                'error': e
                            });
                            console.log('\x1b[31m%s\x1b[0m', tmpTestName);
                            counter++
                            if(counter == limit){
                                _app.produceTestReport(limit, successes, errors);
                            };
                        }
                    })();
                }
            }
        };
    }
};  


// Produce a test outcome report
_app.produceTestReport = function(limit, successes, errors){
    console.log("");
    console.log("---------------BEGIN TEST REPORT---------------");
    console.log("");
    console.log("Total Tests: ", limit);
    console.log("Pass: ", successes);
    console.log("Fail: ", errors.length);
    console.log("");

    // If there are errors, print them in detail
    if(errors.length > 0){
        console.log("-------------------BEGIN ERROR DETAILS-------------------");
        console.log("");

        errors.forEach(function(t){
            console.log('\x1b[31m%s\x1b[0m', t.name);
            console.log(t.error);
            console.log("");
        });

        console.log("");
        console.log("-------------------END ERROR DETAILS-------------------");
    }


    console.log("");
    console.log("---------------END TEST REPORT---------------");

    process.exit(0);

};


// Run the tests
_app.runTests();