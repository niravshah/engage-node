var globals = require('./globals.js');

exports.socketConnection = function(socket) {
    socket.on("register", function(data) {
        console.log(data.name + " talks at " + socket.id);
        globals.clients[data.name] = socket.id;
        console.log("Refreshed Clients List: ");
        for(i in globals.clients) {
            console.log(i + ":" + globals.clients[i]);
        }
    });
    socket.on('disconnect', function() {
        var socketName = null;
        for(var i in globals.clients) {
            if(globals.clients[i] == socket.id) {
                socketName = i;
            }
        }
        if(socketName != null) {
            delete globals.clients[socketName];
        }
        console.log("Refreshed Clients List: ");
        for(i in globals.clients) {
            console.log(i + ":" + globals.clients[i]);
        }
    });
}