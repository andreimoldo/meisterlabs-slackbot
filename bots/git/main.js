var request = require('request');
var _ = require('lodash');
var moment = require('moment');
var vow = require('vow');

module.exports = {
    opts: {
        username: 'Gitbot',
        icon_emoji: ':muscle:'
    },

    initialize: function() {
        this.postWeeklyKing();
    },

    postWeeklyKing: function() {
        var self = this;
        this.fetchWeeklyCommits()
        .then(this.fetchCommitStats)
        .then(this.sortStats)
        .then(this.postToSlack.bind(this));
    },

    fetchWeeklyCommits: function() {
        var self = this;
        var deferred = vow.defer();
        var lastMonday = moment()
                        .set('day', 1)
                        .set('hour', 0)
                        .set('minute', 0)
                        .format('YYYY-MM-DDTHH:MM:SSZ');

        request.get('https://' + process.env.GITHUB_TOKEN + '@api.github.com/repos/meisterlabs/meistertask/commits', {
            qs: {
                sha: 'master_unstable',
                since: lastMonday
            },
            headers: {
                accept: '*/*',
                'user-agent': 'Meisterbot'
            }
        }, function(err, res, body) {
            body = JSON.parse(body);
            deferred.resolve(body);
        });

        return deferred.promise();
    },

    fetchCommitStats: function(commits) {
        var deferred = vow.defer();
        var result = [];
        var fetched = 0;

        _.each(commits, function(commit) {
            var sha = commit.sha;
            request.get('https://' + process.env.GITHUB_TOKEN + '@api.github.com/repos/meisterlabs/meistertask/commits/' + sha, {
                headers: {
                    accept: '*/*',
                    'user-agent': 'Meisterbot'
                }
            }, function(err, res, body) {
                fetched++;
                body = JSON.parse(body);
                var author = body.committer.login;
                var existing = _.findWhere(result, {name: author});
                if (existing) {
                    existing.additions += body.stats.additions;
                    existing.deletions += body.stats.deletions;
                    existing.total += body.stats.total;
                    existing.count += 1;
                } else {
                    result.push({
                        name: author,
                        count: 1,
                        additions: body.stats.additions,
                        deletions: body.stats.deletions,
                        total: body.stats.total
                    });
                }
                if (fetched === commits.length) {
                    deferred.resolve(result);
                }
            });
        });

        return deferred.promise();
    },

    sortStats: function(commits) {
        return commits.sort(function(a, b) {
            return a.total < b.total ? 1 : -1;
        });
    },

    postToSlack: function(stats) {
        var best = stats[0];
        var message = [
            'Author of the Week: ' + best.name,
            'Commits: ' + best.count,
            'Additions: ' + best.additions,
            'Deletions: ' + best.deletions
        ].join('\n');

        this.postMessageToChannel('testing', message);
    }
};
