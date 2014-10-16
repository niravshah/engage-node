var express = require('express');
var http = require('http');
var fs = require("fs");
var mandrill = require('./modules/mandrill.js');
var pocket = require('./modules/pocket.js');
var socket = require('./modules/socket.js');
var globals = require('./modules/globals.js');
var app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));
app.use(express.cookieParser());
app.use(express.session({
    secret: '1234567890QWERTY'
}));
app.set('view engine', 'ejs');
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
var io = require('socket.io').listen(server);
io.sockets.on('connection', socket.socketConnection);
exports.ioCon = io;
app.get('/', function(reques, response) {
    response.render('engage');
});
app.get('/pocket', pocket.getRequestToken);
app.get('/pocket-c', pocket.callback);
app.post('/pocket-add', pocket.addArticle);
app.get('/pocket-get', pocket.getArticles);
app.post('/mandrill-events', mandrill.processMessageEvents);
app.get('/send', mandrill.sendTemplateMessage);
app.post('/final-send', function(request, response) {
    var merge_vars = [];
    merge_vars.push({
        "name": "TITLE",
        "content": request.body.data.account
    });
    var acct = request.body.data.account.replace(/\s+/g, '-').toLowerCase();
    var acctpath = 'public/' + acct;
    var camp = request.body.data.campaign.replace(/\s+/g, '-').toLowerCase();
    var campaign = acctpath + '/' + camp
    var imgPath = campaign + '/trends.png';
    var logoImgPath;
    var base64Data = request.body.data.imgBase64.replace(/^data:image\/png;base64,/, "");
    var acctExists = fs.existsSync(acctpath);
    if(!acctExists) {
        fs.mkdirSync(acctpath);
    }
    var campExists = fs.existsSync(campaign);
    if(!campExists) {
        fs.mkdirSync(campaign);
    }
    try {
        fs.writeFile(imgPath, base64Data, 'base64');
    } catch(err) {
        console.log('Errror');
        console.log(err);
    }
    if(request.body.data.logoImage != undefined) {
        var logoImgData = request.body.data.logoImage.replace(/^data:image\/png;base64,/, "");
        logoImgPath = campaign + '/logo.png';
    } else {
        logoImgPath = "http://page-alarm.codio.io:3000/" + request.body.data.logoImageUrl;
    }
    var logoExisits = fs.existsSync(logoImgPath);
    if(!logoExisits) {
        fs.writeFileSync(imgPath, logoImgData, 'base64');
    }
    merge_vars.push({
        "name": "TIMAGE",
        "content": "http://page-alarm.codio.io:3000/" + acct + '/' + camp + '/trends.png'
    });
    merge_vars.push({
        "name": "LOGO",
        "content": logoImgPath
    });
    var content = request.body.data.content;
    for(cont in content) {
        merge_vars = merge_vars.concat(content[cont].content)
    }
    merge_vars = merge_vars.concat(request.body.data.lnattrs);
    console.log(merge_vars);
    mandrill.sendTemplateMessage(request, response, merge_vars);
});