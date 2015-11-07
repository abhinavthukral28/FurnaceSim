// API Key 03619bf86cab5fbd4896dc3696876ed6
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

//var async = require('async');
var socketio = require('socket.io');
var express = require('express');


var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

var WeatherService = require("./utils/WeatherService.js");

weatherService = new WeatherService();

var desiredTemperature = 20; //desired room temperature


router.use(express.static(path.resolve(__dirname, 'client')));
var sockets = [];

//the objective temperature
//current temperature internal


weatherService.on("weatherUpdate",function(data){
   broadcast(data);
});

io.on('connection', function (socket) {

    if (sockets.length > 0) {
        socket.set("admin", false);
        socket.emit("adminStatus",false);
    }

    else {
        socket.set("admin", true);
        socket.emit("adminStatus",false);
    }

    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on("setFurnaceTemp",function(temp)
    {
        socket.get(("admin"),function(err,isAdmin)
            {
                if (isAdmin)
                    desiredTemperature = temp;
                else socket.emit("notAdmin");
            });

    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  //async.map(
  //  sockets,
  //  function (socket, callback) {
  //    socket.get('name', callback);
  //  },
  //  function (err, names) {
  //    broadcast('roster', names);
  //  }
  //);
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});








var util = require('util'); //needed for inherits
var EventEmitter = require('events').EventEmitter;


var hysteresis = 2.5; //thermostat hysteresis

var Class = function() { }

util.inherits(Class, EventEmitter);

Class.prototype.temp = function(temp) {
    if(temp < desiredTemperature - hysteresis ) {
        this.emit("run");
    }
    else if(temp > desiredTemperature + hysteresis) {
        this.emit("stop");
    }
};

