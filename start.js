var SlackBot = require('slackbots');
var _ = require('lodash');

var Bot = function(props) {
    var self = this;

    this.opts = {
        name: '', // Username of the bot in slack
        emoji: '' // :icon: of the bot that gets displayed as an avatar in slack
    };

    _.extend(this, props);

    this.api = new SlackBot({
        token: process.env.SLACK_TOKEN,
        name: this.opts.name
    })
    .on('open', function() {
        self.initialize();
    });

    this.getActiveUsers = function() {
        return this.api.getUsers().then(function(data) {
            return _.where(data.members, {presence: 'active'});
        });
    };

    this.getRandomActiveUser = function() {
        return this.getActiveUsers().then(function(users) {
            return _.sample(users);
        });
    };

    return this;
};

var fitBot = new Bot(require('./bots/fit/main.js'));
var lunchBot = new Bot(require('./bots/lunch/main.js'));
var gitBot = new Bot(require('./bots/git/main.js'));
