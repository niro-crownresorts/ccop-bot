var Flint = require('node-flint');
var webhook = require('node-flint/webhook');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config.json');
var app = express();
app.use(bodyParser.json());

// init flint
var flint = new Flint(config);
flint.start();
console.log("Starting flint, please wait...");

// say hello
flint.hears('hello', function(bot, trigger) {
  console.log("inside hello..!")
   bot.say('Hello %s! ' + 'Thank you for getting in touch today! How can I help you?', trigger.personDisplayName);
});

// default message for unrecognized commands
flint.hears(/.*/, function(bot, trigger) {
  bot.say('Sorry did not understand what you said!');
}, 20);

// add flint event listeners
flint.on('message', function(bot, trigger, id) {
  flint.debug('"%s" said "%s" in room "%s"', trigger.personEmail, trigger.text, trigger.roomTitle);  

});

flint.on('initialized', function() {
  console.log('initialized %s rooms', flint.bots.length);
  flint.debug('initialized %s rooms', flint.bots.length);
});

// define express path for incoming webhooks
app.post('/flint', webhook(flint));

// start express server
var port = process.env.PORT || config.port;

var server = app.listen(port, function () {
  flint.debug('Flint listening on port %s', port);
});

// gracefully shutdown (ctrl-c)
process.on('SIGINT', function() {
  flint.debug('stoppping...');
  server.close();
  flint.stop().then(function() {
    process.exit();
  });
});