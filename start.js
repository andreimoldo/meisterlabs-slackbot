var SlackBot = require('slackbots');
var _ = require('lodash');

var Fit = require('./bots/fit/main.js');

var createBot = function(name, ready) {
    var bot = new SlackBot({
        token: process.env.SLACK_TOKEN,
        name: name
    })
    .on('open', function() {
        ready(bot);
    });
};

var fitBot = new Fit({name: 'Coach Carter'});
