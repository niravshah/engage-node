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
app.set('view engine','ejs');

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', socket.socketConnection);
exports.ioCon = io;

app.get('/',function(reques,response){
    response.render('engage');
});
app.get('/pocket', pocket.getRequestToken);
app.get('/pocket-c', pocket.callback);
app.post('/pocket-add', pocket.addArticle);
app.get('/pocket-get', pocket.getArticles);
app.post('/mandrill-events', mandrill.processMessageEvents);
app.post('/upload-image', mandrill.uploadImageAndSend);
app.post('/add-articles-send', mandrill.addArticlesAndSend);
app.get('/send', mandrill.sendTemplateMessage);