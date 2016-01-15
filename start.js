var SlackBot = require('slackbots');
var _ = require('lodash');

var API = new SlackBot({
    token: process.env.SLACK_TOKEN
})
.on('open', function() {
    require('./bots/fit/main.js')(API);
    require('./bots/lunch/main.js')(API);
    require('./bots/help/main.js')(API);
    // require('./bots/git/main.js')(API);
});
