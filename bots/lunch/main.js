var cheerio = require('cheerio');
var fs = require('fs');
var later = require('later');
var low = require('lowdb')
var moment = require('moment');
var request = require('request');
var _ = require('lodash');

var restaurants = [
    'rathaus',
    'cantinetta',
    'michls'
].map(function(name) {
    return require('./restaurants/' + name + '.js');
});

module.exports = {
    opts: {
        username: 'Lunchbot',
        icon_emoji: ':fork_and_knife:'
    },

    initialize: function() {
        // database
        this.db = low('./data/lunch.db');
        // test data
        if (process.env.TEST) {
            this.db('menus').remove();
            this.parsePages();
        }
        // delayed job to get data
        var schedule = later.parse.recur()
            .on(1).dayOfWeek()
            .on(3).hour();
        later.setInterval(this.parsePages.bind(this), schedule);

        // slack message handler
        this.api.on('message', this.handleMessage.bind(this));
    },

    handleMessage: function(data) {
        if (data.type !== 'message') {
            return;
        }

        if (data.text.startsWith('@lunch')) {
            // TODO - get channel from data and respond in that channel
            // get today's menu from db
            menus = this.db('menus').where({week: moment().isoWeek(), day: (moment().day() + 7) % 8});
            // post menu
            message = this.buildMessage(menus);
            this.postMessageToChannel('testing', message);
        }
    },

    parsePages: function() {
        var self = this;
        _.forEach(restaurants, function(restaurant) {
            request( { uri: restaurant.uri, headers: { 'User-Agent': 'Chrome' } }, function(err, res, body) {
                if (err) {
                    return console.log('Error when trying to load ' + restaurant.name, err);
                }

                var menus = restaurant.parse(cheerio.load(body));
                _.forEach(menus, function(menu, index) {
                    self.db('menus').push({
                        'week': moment().isoWeek(),
                        'day': index,
                        'name': restaurant.name,
                        'emoji': restaurant.emoji,
                        'options': menu
                    });
                });
            });
        });
    },

    buildMessage: function(menus) {
        return _.reduce(menus, function(message, menu) {
            return message + '\n' + menu.emoji + ' ' + menu.name + '\n' + menu.options;
        }, '');
    }
};

global.String.prototype.reFormat = function() {
    var result = this;

    result = result.split(/\n/g).map(function(str) {
        // Capitalises words
        var splitted = str.split(' ');
        str = splitted.map(function(str, i) {
            // capitalise word if its between two other words and up to 3 chars long
            if (i !== 0 && i !== splitted.length-1 && str.length < 4) return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        }).join(' ');

        //removes allergy warnings
        return str.split(' ').map(function(str1) {
            return str1.split(',').filter(function(str2) {
                if (str2.length === 1 && /[A-Z]/.test(str2)) {
                    return false;
                } else {
                    return true;
                }
            }).join(',');
        }).join(' ');
    }).join('\n');

    // double spaces
    result = result.replace(/  /g, ' ');

    //string:string to string: string
    result = result.replace(/(\w)\:(\w)/g, '$1: $2');

    return result;
};

global.String.prototype.startsWith = function(it) {
    return(this.indexOf(it) === 0);
};
