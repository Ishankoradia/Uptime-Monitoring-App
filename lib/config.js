/*
Create and export config variables
*/

var environments = {};

// staging object for staging environment
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'uptimeMonitoringHashingSecret',
    'maxChecks': 5,
    'twilio' : {
        'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone' : '+15005550006'
    }
};

// production evn
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'uptimeMonitoringHashingSecret',
    'maxChecks': 5,
    'twilio' : {
        'accountSid' : 'AC2ee8e7a22e64271fdc0a8f8072ca0b88',
        'authToken' : 'f4521eed67e60172c37fbb52c1b87e8c',
        'fromPhone' : '+17755227981'
    }
};

// determine which env should be exported using the command line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// export the module
module.exports = environmentToExport;