var cheerio = require('cheerio');
var fs = require('fs');
var moment = require('moment');
var request = require('request');
var _ = require('lodash');


var restaurants = [
    'rathaus',
    'cantinetta',
    'michls',
    'billa'
].map(function(name) {
    return require('./restaurants/' + name + '.js');
});


module.exports = {
    opts: {
        username: 'Lunchbot',
        icon_emoji: ':fork_and_knife:'
    },

    initialize: function() {
        console.log('Lunchbot initializing');
        this.api.on('message', this.handleMessage.bind(this));
        console.log('Lunchbot is listening to messages');
        this.result = {};
        this.i = 0;
    },

    handleMessage: function(data) {
        if (data.type !== 'message') {
            return;
        }
        if (data.text.startsWith('@lunch')) {
            // TODO - get channel from data and respond in that channel
            // TODO - get user and add response: 'Sure, ZZZ, here's what's on the menu today
            if (fs.existsSync(this.getCacheFile()) && !global.testing) {
                var cachedData = JSON.parse(fs.readFileSync(this.getCacheFile()));
                if (_.keys(cachedData).length !== restaurants.length) {
                    // A new restaurant has been added, reparse
                    this.parsePages();
                } else {
                    this.result = cachedData;
                    this.postToSlack();
                }
            } else {
                this.parsePages();
            }
        }
    },

    parsePages: function() {
        var self = this;
        restaurants.forEach(function(restaurant) {
            if (!restaurant.uri) {
                self.result[restaurant.name] = {
                    message: restaurant.message
                };
                return self.doneParsingRestaurant();
            }

            request({uri: restaurant.uri, headers: {'User-Agent': 'Chrome'}}, function(err, res, body) {
                if (err) return console.log('Error when trying to load ' + restaurant.name, err);
                self.result[restaurant.name] = restaurant.parse(cheerio.load(body));
                self.doneParsingRestaurant();
            });
        });
    },

    doneParsingRestaurant: function() {
        this.i++;
        if (this.i === restaurants.length) {
            this.saveCache();
            this.postToSlack();
        }
    },

    postToSlack: function() {
        var menu = this.getTodaysMenus();
        this.postMessageToChannel('testing', menu);
    },

    getTodaysMenus: function() {
        var menus = '';
        var weekday = (moment().day() + 7) % 8;
        var self = this;
        _.each(restaurants, function(restaurant) {
            var menu = self.result[restaurant.name];
            menu = menu.message || menu[weekday];
            menus += restaurant.emoji + ' ' +
                     restaurant.name + '\n' +
                     menu + '\n\n';

        });
        return menus.trim();
    },

    saveCache: function() {
        if (!fs.existsSync('./cache/')) fs.mkdirSync('./cache/');
        fs.writeFileSync(this.getCacheFile(), JSON.stringify(this.result), 'utf8');
        fs.exists(this.getPreviousCacheFile(), function(exists) {
            if (exists) fs.unlink(this.getPreviousCacheFile());
        });
    },

    getCacheFile: function() {
        var weekNumber = moment().isoWeek();
        return './cache/' + weekNumber + '.json';
    },

    getPreviousCacheFile: function() {
        var weekNumber = moment().isoWeek();
        var prevWeekNumber = moment().week(weekNumber - 1).isoWeek();
        return './cache/' + prevWeekNumber + '.json';
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
