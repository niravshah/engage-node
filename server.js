var express = require('express');
var http = require('http');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/engage');
var nots = db.get('eg1');
var fs = require("fs");
var req = require('superagent');
var qs = require('querystring');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('cIUPQCSZ5Kz6gmwlKf188Q');
var scraperjs = require('scraperjs');
var consumer_key = "32472-79c3c01d6d9164b5f0403260";
var engage_callback = "http://page-alarm.codio.io:3000/pocket-c";
var pocket_auth = "https://getpocket.com/auth/authorize?";
var pocket_req_token = null;
var app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));
app.use(express.cookieParser());
app.use(express.session({
    secret: '1234567890QWERTY'
}));
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
var io = require('socket.io').listen(server);
var clients = {};
io.sockets.on('connection', function(socket) {
    socket.on("register", function(data) {
        console.log(data.name + " talks at " + socket.id);
        clients[data.name] = socket.id;
        console.log("Refreshed Clients List: ");
        for(i in clients) {
            console.log(i + ":" + clients[i]);
        }
    });
    socket.on('disconnect', function() {
        var socketName = null;
        for(var i in clients) {
            if(clients[i] == socket.id) {
                socketName = i;
            }
        }
        if(socketName != null) {
            delete clients[socketName];
        }
        console.log("Refreshed Clients List: ");
        for(i in clients) {
            console.log(i + ":" + clients[i]);
        }
    });
});
app.get('/pocket', function(request, response) {
    req.post('https://getpocket.com/v3/oauth/request').send({
        'consumer_key': consumer_key,
        'redirect_uri': engage_callback
    }).set('Content-Type', 'application/json; charset=UTF8').set('X-Accept', 'application/json').end(function(error, res) {
        pocket_req_token = res.body.code
        var pocket_auth_args = qs.stringify({
            'request_token': res.body.code,
            'redirect_uri': engage_callback
        });
        response.redirect(pocket_auth + pocket_auth_args);
    });
});
app.get('/pocket-c', function(request, response) {
    req.post("https://getpocket.com/v3/oauth/authorize").send({
        'consumer_key': consumer_key,
        'code': pocket_req_token
    }).set('Content-Type', 'application/json; charset=UTF8').set('X-Accept', 'application/json').end(function(error, res) {
        request.session.pocket_access_token = res.body.access_token;
        console.log('Session Access Token:' + request.session.pocket_access_token);
        req.post("https://getpocket.com/v3/get").send({
            'consumer_key': consumer_key,
            'access_token': res.body.access_token
        }).set('Content-Type', 'application/json; charset=UTF8').set('X-Accept', 'application/json').end(function(error, res) {
            response.redirect('/add.html');
        });
    })
})
app.post('/pocket-add', function(request, response) {
    req.post("https://getpocket.com/v3/add").send({
        'consumer_key': consumer_key,
        'access_token': request.session.pocket_access_token,
        url: request.body.articleUrl
    }).set('Content-Type', 'application/json; charset=UTF8').set('X-Accept', 'application/json').end(function(error, res) {
        console.log(request.session.pocket_access_token);
        console.log(res.body.item);
    });
    response.send(200, 'Done');
})
app.post('/upload-image', function(request, response) {
    var base64Data = request.body.imgBase64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("public/out.png", base64Data, 'base64', function(err) {
        if(err) throw err;
        console.log('It\'s saved!');
    });
    var message = getMessage("out.png");
    sendTemplateMessage("test", [], message, response);
});
app.post('/mandrill-events', function(request, response) {
    var events = eval('(' + request.body.mandrill_events + ')');
    for(i in events) {
        console.log(events[i].event + "|" + events[i].msg.email + "|" + events[i].msg.subaccount);
        if(events[i].event == 'click') {
            console.log(events[i].url + "|" + events[i].user_agent_parsed.mobile + "|" + events[i].location.country_short);
        }
        delete events[i]._id;
        nots.insert(events[i], function(err, doc) {
            if(err) {
                console.log("Error while writing to MongoDB: " + err);
            } else {
                console.log("Inserted object to MongoDBL " + JSON.stringify(doc));
            }
        });
        var to = clients[events[i].msg.subaccount];
        if(to != undefined) {
            console.log("To " + to);
            io.to(to).emit('message', events[i]);
        } else {
            console.log("No open socket");
        }
    }
    var d = new Date();
    response.send(200, {
        date: d
    });
});
app.post('/mandrill-inbound', function(request, response) {
    var events = eval('(' + request.body.mandrill_events + ')');
    for(i in events) {
        console.log(events[i].event + "|" + events[i].msg.email + "|" + events[i].msg.subaccount);
        if(events[i].event == 'inbound') {
            console.log(events[i].msg.raw_msg + "|" + events[i].msg.from_email + "|" + events[i].msg.from_name);
        }
        var to = clients[events[i].msg.subaccount];
        if(to != undefined) {
            console.log("To " + to);
            io.to(to).emit('message', events[i]);
        } else {
            console.log("No open socket");
        }
    }
    var d = new Date();
    response.send(200, {
        date: d
    });
});
app.post('/mandrill-archive-inbound', function(request, response) {
    var events = eval('(' + request.body.mandrill_events + ')');
    for(i in events) {
        console.log(events[i].event + "|" + events[i].msg.email + "|" + events[i].msg.subaccount);
        if(events[i].event == 'inbound') {
            console.log("Inbound for Archival " + events[i].msg.raw_msg + "|" + events[i].msg.from_email + "|" + events[i].msg.from_name);
            fs.writeFile("public/archive.html", events[i].msg.html, function(err) {
                if(err) throw err;
                console.log('It\'s saved!');
            });
        }
    }
    var d = new Date();
    response.send(200, {
        date: d
    });
});

function getMessage(imagename) {
    return {
        "subject": "Engage Trends",
        "from_email": "nirav@letsengage.co",
        "from_name": "Nirav",
        "to": [{
            "email": "nirav.shah83@gmail.com",
            "name": "Nirav Shah",
            "type": "to"
        }],
        "headers": {
            "Reply-To": "nirav@letsengage.co"
        },
        "important": false,
        "bcc_address": "message-archive@letsengage.co",
        "track_opens": true,
        "track_clicks": true,
        "auto_text": null,
        "auto_html": null,
        "inline_css": null,
        "url_strip_qs": null,
        "preserve_recipients": null,
        "view_content_link": null,
        "tracking_domain": null,
        "signing_domain": null,
        "return_path_domain": null,
        "merge": false,
        "global_merge_vars": [{
            "name": "IMAGENAME",
            "content": imagename
        }],
        "merge_vars": [],
        "tags": [],
        "subaccount": "test-engage",
        "metadata": {
            "website": "www.example.com"
        },
        "recipient_metadata": [{
            "rcpt": "recipient.email@example.com",
            "values": {
                "user_id": 123456
            }
        }],
        "attachments": [],
        "images": []
    };
}

function sendTemplateMessage(templateName, templateContent, message, response) {
    mandrill_client.messages.sendTemplate({
        "template_name": templateName,
        "template_content": templateContent,
        "message": message,
        "async": false,
        "ip_pool": null,
        "send_at": null
    }, function(result) {
        console.log(result);
        response.send(200, result);
    }, function(e) {
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        response.send(500, e);
    });
}
app.get('/send', function(request, response) {
    var template_name = "test";
    var template_content = [];
    var message = getMessage(null);
    sendTemplateMessage(template_name, template_content, message, response);
});