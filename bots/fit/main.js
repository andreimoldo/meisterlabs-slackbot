var _ = require('lodash');
var moment = require('moment-timezone');

module.exports = {
    opts: {
        name: 'Coach Carter',
        emoji: ':muscle:'
    },

    exercises: [
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
    ],

    initialize: function() {
        this.sendChallenge();
    },

    getRandomExercise: function() {
        return _.sample(this.exercises);
    },

    isAllowedToSend: function() {
        var now = moment.tz('Europe/Berlin');

        var isWeekend = now.day() === 0 || now.day() === 6;
        var officeWorkingTime = now.hours() > 9 && now.hours() < 17;

        return !isWeekend && officeWorkingTime;
    },

    sendChallenge: function() {
        if (!this.isAllowedToSend()) {
            return console.log(this.opts.name, 'is not allowed to send challenges yet!');
        }

        var exercise = this.getRandomExercise();

        this.getRandomActiveUser().then(function(user) {
            console.log('@' + user.name, exercise.quantity, exercise.name, 'NOW!');
        });
    }
};
