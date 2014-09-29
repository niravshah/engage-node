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
        if(events[i].msg.from_email == 'message-archive@letsengage.co') {
            fs.writeFile("public/archive.html", events[i].msg.html, function(err) {
                if(err) throw err;
                console.log('It\'s saved!');
            });
        }
        delete events[i]._id;
        globals.nots.insert(events[i], function(err, doc) {
            if(err) {
                console.log("Error while writing to MongoDB: " + err);
            } else {
                console.log("Inserted object to MongoDBL ");
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
exports.addArticlesAndSend = function(request, response) {
    var message = getMessage(request.body.merge_vars);
    //console.log("addArticlesAndSend" + JSON.stringify(message));
    sendTemplateMessage("test", [], message, response);
}
exports.uploadImageAndSend = function(request, response) {
    var base64Data = request.body.imgBase64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("public/out.png", base64Data, 'base64', function(err) {
        if(err) throw err;
        console.log('It\'s saved!');
    });
    var mergevars = [{
        "name": "IMAGENAME",
        "content": "out.png"
    }];
    var message = getMessage(mergevars);
    sendTemplateMessage("test", [], message, response);
};
exports.sendTemplateMessage = function(request, response) {
    var mergevars = [];
    var message = getMessage(mergevars);
    sendTemplateMessage("test", [], message, response);
};

function getMessage(mergevars) {
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
        "global_merge_vars": mergevars,
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
        response.send(200, result);
    }, function(e) {
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        response.send(500, e);
    });
};