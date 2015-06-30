var SlackBot = require('slackbots');
var _ = require('lodash');

var API = new SlackBot({
    token: process.env.SLACK_TOKEN
})
.on('open', function() {
    console.log('Bot is ready!');
    // var fitBot = new Bot(require('./bots/fit/main.js'));
    var lunchBot = new Bot(require('./bots/lunch/main.js'));
    // var gitBot = new Bot(require('./bots/git/main.js'));
    // new Bot({
    //     opts: {
    //         username: 'Happybot',
    //         icon_emoji: ':cat:'
    //     },
    //     initialize: function() {
    //         console.log(this.opts);
    //         // this.api.postMessageToChannel('mt-dev', 'meow! :)', this.opts);
    //
    //     }
    // });
});

var Bot = function(props) {
    var self = this;

    _.extend(this, props);

    this.api = API;
    this.initialize();

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

    this.postMessageToChannel = function(channel, message) {
        this.api.postMessageToChannel(channel, message, this.opts);
    };

    return this;
};
