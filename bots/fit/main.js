var SlackBot = require('slackbots');
var _ = require('lodash');
var moment = require('moment')

function FitBot(params) {
    this._name = params.name;
    this._api = null;

    this.init();
}

FitBot.prototype.EXERCISES = [
    {
        name: 'PUSHUPS',
        max_reps: 10
    },
    {
        name: 'LUNGES',
        max_reps: 15
    }
];

FitBot.prototype.init = function() {
    console.log(this._name, 'initializing...');
    this._api = new SlackBot({
        token: process.env.SLACK_TOKEN,
        name: this._name
    }).on('open', function() {
        this._start();
    }.bind(this));
};

FitBot.prototype._start = function() {
    // TODO: check if it's the right time to send a message
    // Monday - Friday
    // 0900 - 17000

    // get active users
    this._getActiveUsers(function(activeUsers) {
        // get victim
        var victim = activeUsers[Math.floor(Math.random() * activeUsers.length)];
        // get exercise
        var exercise = this.EXERCISES[Math.floor(Math.random() * this.EXERCISES.length)];
        console.log('@', victim.name, exercise.max_reps, exercise.name, 'NOW!');
    }.bind(this));
};

FitBot.prototype._getActiveUsers = function(callback) {
    this._api.getUsers().then(function(data) {
        var activeMembers = _.filter(data.members, function(member) {
            return member.presence && member.presence === 'active';
        });
        callback(activeMembers);
    });
};

module.exports = FitBot;
