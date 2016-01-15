var _ = require('lodash');

var isLobsterbotMention = require('../is-lobsterbot-mention');
var isMessage = require('../is-message');
var messageContains = require('../message-contains');
var getRandomActiveUser = require('../get-random-active-user');
var generateMention = require('../generate-mention');
var exercises = require('./exercises');

var generateExercise = function(exercises, user) {
    var randomExc = _.sample(exercises);
    return [
        generateMention(user),
        getRandomAmount(randomExc),
        randomExc.unit,
        randomExc.name,
        'NOW!'
    ].join(' ');
};

var getRandomAmount = function(exercise) {
    var max = exercise.max;
    var min = exercise.min;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

var isValidMessage = function(data) {
    return isMessage(data) && isLobsterbotMention(data) && messageContains('fit', data);
};

module.exports = function(API) {
    console.log('Fitbot running');

    API.on('message', function(data) {
        if (!isValidMessage(data)) return;

        getRandomActiveUser(API)
        .then(function(user) {
            var message = generateExercise(exercises, user);
            API.postMessage(data.channel, message, {
                username: 'Coach Carter',
                icon_emoji: ':muscle:'
            });
        });
    });
};
