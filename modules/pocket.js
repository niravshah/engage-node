var req = require('superagent');
var consumer_key = "32472-79c3c01d6d9164b5f0403260";
var engage_callback = "http://page-alarm.codio.io:3000/pocket-c?name=";
var pocket_auth = "https://getpocket.com/auth/authorize?";
var pocket_req_token = null;
var qs = require('querystring');
var globals = require('./globals.js');
var server = require('./../server.js');
exports.getRequestToken = function(request, response) {
    console.log('Getting Pocket Request for:' + request.query.name);
    req.post('https://getpocket.com/v3/oauth/request').send({
        'consumer_key': consumer_key,
        'redirect_uri': engage_callback,
        'state': request.query.name
    }).set('Content-Type', 'application/json; charset=UTF8').set('X-Accept', 'application/json').end(function(error, res) {
        pocket_req_token = res.body.code
        var pocket_auth_args = qs.stringify({
            'request_token': res.body.code,
            'redirect_uri': engage_callback + res.body.state
        });
        response.send(200, {
            'redirect_url': pocket_auth + pocket_auth_args
        });
    });
};
exports.callback = function(request, response) {
    console.log('Got Callback for:' + request.query.name);
    req.post("https://getpocket.com/v3/oauth/authorize").send({
        'consumer_key': consumer_key,
        'code': pocket_req_token
    }).set('Content-Type', 'application/json; charset=UTF8').set('X-Accept', 'application/json').end(function(error, res) {
        request.session.pocket_access_token = res.body.access_token;
        request.session.name = request.query.name;
        var to = globals.clients[request.session.name];
        if(to != undefined) {
            console.log("To " + to);
            server.ioCon.to(to).emit('pocket-auth', {
                'event': 'Pocket Auth'
            });
        } else {
            console.log("No open socket");
        }
        response.send(200, 'Pocket Authorization Complete. Please Return to Engage.');
    })
};
exports.getArticles = function(request, response) {
    req.post("https://getpocket.com/v3/get").send({
        'consumer_key': consumer_key,
        'access_token': request.session.pocket_access_token,
        'sort': 'newest',
        'detailType':'complete',
        'count': 10
    }).set('Content-Type', 'application/json; charset=UTF8').set('X-Accept', 'application/json').end(function(error, res) {
        response.send(200, {
            'list': res.body.list
        });
    });
}
exports.addArticle = function(request, response) {
    req.post("https://getpocket.com/v3/add").send({
        'consumer_key': consumer_key,
        'access_token': request.session.pocket_access_token,
        url: request.body.articleUrl
    }).set('Content-Type', 'application/json; charset=UTF8').set('X-Accept', 'application/json').end(function(error, res) {
        if(res.body.item) {
            var to = globals.clients[request.session.name];
            if(to != undefined) {
                console.log("Sending Not to " + to);
                server.ioCon.to(to).emit('pocket-event', {
                    'event': 'New Article Added ' + res.body.item.normal_url
                });
            } else {
                console.log("No open socket");
            }
        }
        response.send(200, 'Done');
    });
};