var request = require('request');
var _ = require('lodash');

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
    if (data.type !== 'message') {
      return;
    }
    var self = this;

    if (data.text && data.text.startsWith('@lunch')) {
      request('http://www.mittagsmonster.com/data?lat=48.2121389&lon=16.3575148&page=0&emailaddress=&address=Ebendorferstraße+3%2C+1010&rnd=0.7970078771468252&_=1452508002109', function(error, response, body) {
        var restaurants = JSON.parse(body);
        var names = _.map(restaurants, function(restaurant) {
          console.log(restaurant.Restaurant.Name);
        });

        console.log(names.join(' '));
      })
    }
  },

};

global.String.prototype.startsWith = function(it) {
  return(this.indexOf(it) === 0);
};
