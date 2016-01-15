var _ = require('lodash');

module.exports = function(API) {
    return API.getUsers().then(function(data) {
        return _.where(data.members, {presence: 'active'});
    });
};
