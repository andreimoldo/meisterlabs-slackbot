var request = require('request');
var _ = require('lodash');
var emojis = require('./emojis');

var channels = {};

var getRestaurantName = function(name) {
    return [
        _.shuffle(emojis)[0], ' ', '*', name, '*'
    ].join('');
};

var getMenus = function(opts, cb) {
    opts = opts || {};
    request('http://www.mittagsmonster.com/data?lat=48.2121389&lon=16.3575148&page=' + (opts.page || 0) + '&emailaddress=&address=Ebendorferstraße+3%2C+1010&rnd=0.7970078771468252&_=1452508002109', function(error, response, body) {
        var restaurants = JSON.parse(body);
        var message = _.map(restaurants, function(restaurant) {
            return [
                getRestaurantName(restaurant.Restaurant.Name),
                restaurant.Menus.map(function(menu) {
                    return menu.Meal + ' ' + menu.Price
                }).join('\n')
            ].join('\n')
        }).join('\n\n');
        cb && cb(message);
    });
};

module.exports = {
    opts: {
        username: 'Lunchbot',
        icon_emoji: ':fork_and_knife:'
    },

    initialize: function() {
        // slack message handler
        this.api.on('message', this.handleMessage.bind(this));
    },

    handleMessage: function(data) {
        var self = this;
        if (data.type !== 'message') return;
        var text = (data.text || '').toLowerCase();
        if (!_.startsWith(text, '@lunch')) return;

        channels[data.channel] = channels[data.channel] || 0;
        if (/more|moar/.test(text)) channels[data.channel]++;

        getMenus({
            page: channels[data.channel]
        }, function(message) {
            self.api.postMessage(data.channel, message, self.opts);
        });
    }
};
