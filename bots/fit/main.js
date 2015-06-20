var SlackBots = require('slackbots');
var _ = require('lodash');
var moment = require('moment-timezone');

function FitBot(params) {
    this._name = params.name;
    this._emoji = ':muscle:';
    this._api = null;

    this.init();
}

FitBot.prototype.EXERCISES = [
    {
        name: 'PUSHUPS',
        quantity: '10'
    },
    {
        name: 'LUNGES',
        quantity: '15'
    },
    {
        name: 'WALL SIT',
        quantity: '30 SECONDS'
    },
    {
        name: 'PLANK',
        quantity: '30 SECONDS'
    }
];

FitBot.prototype.init = function() {
    console.log(this._name, 'initializing...');
    this._api = new SlackBots({
        token: process.env.SLACK_TOKEN,
        name: this._name
    }).on('open', function() {
        this._start();
    }.bind(this));
};

FitBot.prototype._start = function() {
    console.log(this._name, 'started');
    this._sendChallenge();
};

FitBot.prototype._sendChallenge = function() {
    var now = moment.tz('Europe/Berlin');
    if (now.day() != 0 && now.day() != 6 && now.hours() > 9 && now.hours() < 17) {
        this._getActiveUsers(function(activeUsers) {
            var victim = activeUsers[Math.floor(Math.random() * activeUsers.length)];
            var exercise = this.EXERCISES[Math.floor(Math.random() * this.EXERCISES.length)];
            console.log('@', victim.name, exercise.quantity, exercise.name, 'NOW!');
        }.bind(this));
    } else {
        console.log(this._name, 'is not allowed to send challenges yet!');
    }
    setTimeout(this._sendChallenge.bind(this), 10000);
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
