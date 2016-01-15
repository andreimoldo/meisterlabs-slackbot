var isLobsterbotMention = require('../is-lobsterbot-mention');
var isMessage = require('../is-message');
var messageContains = require('../message-contains');

var isValidMessage = function(data) {
    return isMessage(data) &&
           isLobsterbotMention(data) &&
           messageContains('help', data);
};

var getHelpMessage = function() {
    return [
        ['Case insensitive, can contain any other words'],
        ['`@lobsterbot fit`', 'Assign random exercise to a random user'],
        ['`@lobsterbot lunch`', 'Grab lunch from mittagsmonster'],
        ['`@lobsterbot lunch more|moar`', 'Next lunch page from mittagsmonster'],
    ]
    .map(function(message) {
        return message.join(' - ');
    })
    .join('\n');
};

module.exports = function(API) {
    API.on('message', function(data) {
        if (!isValidMessage(data)) return;
        API.postMessage(data.channel, getHelpMessage(), {
            username: 'Lobsterbot',
            icon_url: 'https://dl.dropboxusercontent.com/u/12499310/meisterlobster.jpg'
        });
    });
};
