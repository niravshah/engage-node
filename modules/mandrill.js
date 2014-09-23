var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('cIUPQCSZ5Kz6gmwlKf188Q');
var fs = require("fs");
var globals = require('./globals.js');
var server = require('./../server.js');

exports.processMessageEvents = function(request, response) {
    var events = eval('(' + request.body.mandrill_events + ')');
    for(i in events) {
        console.log(events[i].event + "|" + events[i].msg.email + "|" + events[i].msg.subaccount);
        if(events[i].event == 'click') {
            console.log(events[i].url + "|" + events[i].user_agent_parsed.mobile + "|" + events[i].location.country_short);
        }
        delete events[i]._id;
        globals.nots.insert(events[i], function(err, doc) {
            if(err) {
                console.log("Error while writing to MongoDB: " + err);
            } else {
                console.log("Inserted object to MongoDBL " + JSON.stringify(doc));
            }
        });
        var to = globals.clients[events[i].msg.subaccount];
        if(to != undefined) {
            console.log("To " + to);
            server.ioCon.to(to).emit('message', events[i]);
        } else {
            console.log("No open socket");
        }
    }
    var d = new Date();
    response.send(200, {
        date: d
    });
};
exports.processInboundEmails = function(request, response) {
    var events = eval('(' + request.body.mandrill_events + ')');
    for(i in events) {
        console.log(events[i].event + "|" + events[i].msg.email + "|" + events[i].msg.subaccount);
        if(events[i].event == 'inbound') {
            console.log(events[i].msg.raw_msg + "|" + events[i].msg.from_email + "|" + events[i].msg.from_name);
        }
        var to = globals.clients[events[i].msg.subaccount];
        if(to != undefined) {
            console.log("To " + to);
            server.ioCon.to(to).emit('message', events[i]);
        } else {
            console.log("No open socket");
        }
    }
    var d = new Date();
    response.send(200, {
        date: d
    });
};
exports.archiveInbound = function(request, response) {
    var events = eval('(' + request.body.mandrill_events + ')');
    for(i in events) {
        console.log(events[i].event + "|" + events[i].msg.email + "|" + events[i].msg.subaccount);
        if(events[i].event == 'inbound') {            
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
};
exports.uploadImageAndSend = function(request, response) {
    var base64Data = request.body.imgBase64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("public/out.png", base64Data, 'base64', function(err) {
        if(err) throw err;
        console.log('It\'s saved!');
    });
    var message = getMessage("out.png");
    sendTemplateMessage("test", [], message, response);
};
exports.sendTemplateMessage = function(request, response) {
    var template_name = "test";
    var template_content = [];
    var message = getMessage(null);
    sendTemplateMessage(template_name, template_content, message, response);
};

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
};

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
};