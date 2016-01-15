var getActiveUsers = require('./get-active-users');
var _ = require('lodash');

module.exports = function(API) {
    return getActiveUsers(API)
    .then(function(users) {
        return _.sample(users);
    });
};
