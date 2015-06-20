var cheerio = require('cheerio');
var express = require('express');
var fs = require('fs');
var moment = require('moment-timezone');
var _ = require('lodash');


restaurants: [
    'rathaus',
    'cantinetta',
    'michls',
    'billa'
].map(function(name) {
    require('./restaurants/' + name + '.js');
});
console.log(restaurants);


module.exports = {
    opts: {
        name: 'Lunchbot',
        emoji: ':fork_and_knife'
    },

    initialize: function() {
        console.log('Lunchbot initializing');
        this.app = express();
        this.port = process.env.PORT || 3001;
        this.app.all('/lunch', this.handleRequest.bind(this));
        this.app.listen(this.port, function() {
            console.log('Lunchbot is listening');
        });
        this.result = {};
    },

    handleRequest: function() {
        console.log('yo');
        if (fs.existsSync(this.getCacheFile()) && !global.testing) {
            var cachedData = JSON.parse(fs.readFileSync(this.getCacheFile()));
            if (_.keys(cachedData).length !== restaurants.length) {
                // A new restaurant has been added, reparse
                this.parsePages();
            } else {
                this.result = cachedData;
                // postToSlack();
            }
        } else {
            this.parsePages();
        }
    },

    parsePages: function() {
        restaurants.forEach(function(restaurant) {
            // For some jokes :P
            if (!restaurant.uri) {
                this.result[restaurant.name] = {
                    message: restaurant.message
                };
                return this.doneParsingRestaurant();
            }

            request({uri: restaurant.uri, headers: {'User-Agent': 'Chrome'}}, function(err, res, body) {
                if (err) return console.log('Error when trying to load ' + restaurant.name, err);
                this.result[restaurant.name] = restaurant.parse(cheerio.load(body));
                this.doneParsingRestaurant();
            });
        });
    },

    doneParsingRestaurant: function() {
        i++;
        if (i === restaurants.length) {
            this.saveCache();
            postToSlack();
        }
    },

    getTodaysMenus: function() {
        var menus = '';
        var weekday = (moment().day() + 7) % 8;
        _.each(restaurants, function(restaurant) {
            var menu = this.result[restaurant.name];
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
