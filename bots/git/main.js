var request = require('request');
var _ = require('lodash');
var moment = require('moment');
var vow = require('vow');

var isLobsterbotMention = require('../is-lobsterbot-mention');

var requestedWeeklyKing = function(text) {
    text = text.toLowerCase();
    return /weekly/.test(text) && /king/.test(text);
};

var getLastMondayDate = function() {
    return moment()
    .set('day', 1)
    .set('hour', 0)
    .set('minute', 0)
    .format('YYYY-MM-DDTHH:MM:SSZ');
};

var getHeaders = function() {
    return {
        accept: '*/*',
        'user-agent': 'Meisterbot'
    };
};

var fetch = function(repo, branch, day) {
    var deferred = vow.defer();
    request.get('https://' + process.env.GITHUB_TOKEN + '@api.github.com/repos/meisterlabs/' + repo + '/commits', {
        qs: {
            sha: branch,
            since: getLastMondayDate()
        },
        headers: getHeaders(),
    }, function(err, res, body) {
        var data = JSON.parse(body).map(function(commit) {
            var deferred1 = vow.defer();
            request.get('https://' + process.env.GITHUB_TOKEN + '@api.github.com/repos/meisterlabs/' + repo + '/commits/' + commit.sha, {
                headers: getHeaders()
            }, function(err, res, body) {
                deferred1.resolve(JSON.parse(body));
            });
            return deferred1.promise();
        });
        deferred.resolve(vow.all(data));
    });
    return deferred.promise();
};

module.exports = {
    initialize: function() {
        this.api.on('message', this.handleMessage.bind(this));
    },

    handleMessage: function(data) {
        if (data.type !== 'message') return;
        var text = data.text;
        if (!isLobsterbotMention(text)) return;
        if (requestedWeeklyKing(text)) this.postWeeklyKing(data);
    },

    postWeeklyKing: function(data) {
        var self = this;
        vow.all([
            fetch('meistertask', 'master_unstable', getLastMondayDate()),
            fetch('meistertask_desktop', 'master', getLastMondayDate()),
            fetch('mindmeister', 'master', getLastMondayDate()),
        ])
        .then(function(data) {
            return _.flatten(data);
        })
        .then(this.getStats)
        .then(this.getBest)
        .then(this.constructMessage)
        .then(function(message) {
            self.api.postMessage(data.channel, '`meistertask:unstable`, `meistertask_desktop:master`, `mindmeister:master`', message);
        });
    },

    getStats: function(commits) {
        var result = [];

        commits.forEach(function(commit) {
            var author = commit.committer.login;
            var existing = _.findWhere(result, {name: author});
            if (existing) {
                existing.additions += commit.stats.additions;
                existing.deletions += commit.stats.deletions;
                existing.count += 1;
            } else {
                result.push({
                    name: author,
                    avatar: commit.committer.avatar_url,
                    count: 1,
                    additions: commit.stats.additions,
                    deletions: commit.stats.deletions
                });
            }
        });

        return vow.resolve(result);
    },

    getBest: function(users) {
        var result = {
            commits: [0],
            additions: [0],
            deletions: [0]
        };

        users.forEach(function(user) {
            if (user.count > result.commits[0]) {
                result.commits = [user.count, user.name, user.avatar];
            }
            if (user.additions > result.additions[0]) {
                result.additions = [user.additions, user.name, user.avatar];
            }
            if (user.deletions > result.deletions[0]) {
                result.deletions = [user.deletions, user.name, user.avatar];
            }
        });

        return result;
    },

    constructMessage: function(stats) {
        return {
            username: 'Weekly King',
            icon_emoji: ':muscle:',
            attachments: JSON.stringify([
                {
                    author_name: stats.commits[1],
                    author_icon: stats.commits[2],
                    title: 'Commits: ' + stats.commits[0],
                    color: 'warning'
                },
                {
                    author_name: stats.additions[1],
                    author_icon: stats.additions[2],
                    title: 'Additions: ' + stats.additions[0],
                    color: 'good'
                },
                {
                    author_name: stats.deletions[1],
                    author_icon: stats.deletions[2],
                    title: 'Deletions: ' + stats.deletions[0],
                    color: 'danger'
                }
            ])
        };
    }
};
