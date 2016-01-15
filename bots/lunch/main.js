var request = require('request');
var _ = require('lodash');

var emojis = require('./emojis');
var isLobsterbotMention = require('../is-lobsterbot-mention');
var isMessage = require('../is-message');
var messageContains = require('../message-contains');

var nl = function(amount) {
    return _.repeat('\n', amount);
};

var join = function(arr, str) {
    return arr.join(str || '');
};

var mapJoin = function(arr, fn, str) {
    return join(arr.map(fn), str);
};

var isValidMessage = function(data) {
    return isMessage(data) && isLobsterbotMention(data) && messageContains('lunch', data);
};

var getRestaurantName = function(name) {
    return join([
        _.sample(emojis), ' ', '*', name, '*'
    ]);
};

var getMenuText = function(menu) {
    return menu.Meal + ' ' + menu.Price;
};

var getMenus = function(opts, cb) {
    opts = opts || {};
    request('http://www.mittagsmonster.com/data?lat=48.2121389&lon=16.3575148&page=' + (opts.page || 0) + '&emailaddress=&address=Ebendorferstraße+3%2C+1010&rnd=0.7970078771468252&_=1452508002109', function(error, response, body) {
        var restaurants = JSON.parse(body);
        var message = mapJoin(restaurants, function(restaurant) {
            return join([
                getRestaurantName(restaurant.Restaurant.Name),
                mapJoin(restaurant.Menus, getMenuText, nl(1))
            ], nl(1))
        }, nl(2));
        cb && cb(message);
    });
};

module.exports = function(API) {
    console.log('Lunchbot running');

    var channels = {};

    API.on('message', function(data) {
        if (!isValidMessage(data)) return;

        channels[data.channel] = channels[data.channel] || 0;
        if (messageContains('more', data) || messageContains('moar', data)) channels[data.channel]++;

        getMenus({
            page: channels[data.channel]
        }, function(message) {
            API.postMessage(data.channel, message, {
                username: 'Lunchbot',
                icon_emoji: ':fork_and_knife:'
            });
        });
    });
};
