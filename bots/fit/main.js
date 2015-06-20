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
            min: 5,
            max: 20,
            unit: ''
        },
        {
            name: 'LUNGES',
            min: 5,
            max: 20,
            unit: ''
        },
        {
            name: 'WALL SIT',
            min: 15,
            max: 30,
            unit: 'SECONDS'
        },
        {
            name: 'PLANK',
            min: 15,
            max: 30,
            unit: 'SECONDS'
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
             .every(2).second();

        later.setInterval(this.sendChallenge.bind(this), schedule);
    },

    getRandomExercise: function() {
        return _.sample(this.exercises);
    },

    sendChallenge: function() {
        var exercise = this.getRandomExercise();
        var amount = this.getRandomAmount(exercise);

        this.getRandomActiveUser().then(function(user) {
            console.log('@' + user.name, amount, exercise.unit, exercise.name, 'NOW!');
        });
    },

    getRandomAmount: function(exercise) {
        var max = exercise.max;
        var min = exercise.min;

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};
