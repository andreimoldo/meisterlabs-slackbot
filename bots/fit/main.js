var _ = require('lodash');
var later = require('later');

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
        process.env.TEST ?
            this.initTestJob() :
            this.initJob();
    },

    initJob: function() {
        var schedule =
        later.parse.recur()
             .every(1).hour() // TODO some random deviation so it comes unexpectedly? :P
             .after(9).hour()
             .before(17).hour()
             .onWeekday();

        later.setInterval(this.sendChallenge.bind(this), schedule);
    },

    initTestJob: function() {
        var schedule =
        later.parse.recur()
             .every(10).second();

        later.setInterval(this.sendChallenge.bind(this), schedule);
    },

    getRandomExercise: function() {
        return _.sample(this.exercises);
    },

    sendChallenge: function() {
        var exercise = this.getRandomExercise();

        this.getRandomActiveUser().then(function(user) {
            console.log('@' + user.name, exercise.quantity, exercise.name, 'NOW!');
        });
    }
};
