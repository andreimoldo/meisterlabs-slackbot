var SlackBot = require('slackbots');
var _ = require('lodash');

var createBot = function(name, ready) {
    var bot = new SlackBot({
        token: process.env.SLACK_TOKEN,
        name: name
    })
    .on('open', function() {
        ready(bot);
    });
};

var fit = require('./bots/fit/main.js');
createBot(fit.botName, fit.start);

var lunch = require('./bots/lunch/main.js');
createBot(lunch.botName, lunch.start);
