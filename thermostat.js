



var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var express = require('express');
var WeatherService = require("./utils/WeatherService.js");

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
weatherService = new WeatherService();

router.use(express.static(path.resolve(__dirname, 'client')));

var hysteresis = 2.5; //thermostat hysteresis
var desiredTemperature = 20; //desired room temperature


var outsideTemperature;
var internalTemperature = 15;

var serviceCache;

var furnaceStatus = undefined;

var sockets = [];

//the objective temperature
//current temperature internal


weatherService.on("weatherUpdate",function(data){

    var json = JSON.parse(data);

    outsideTemperature = json["main"].temp;

    serviceCache = data;

   broadcast(data);


});



io.of("/furnace").on("connection",function(socket){
    if (furnaceStatus == undefined) {
        socket.on("running", function () {
            furnaceStatus = true;
        });

        socket.on("stopping", function () {
            furnaceStatus = false;
        });

        socket.on("disconnect", function () {
            furnaceStatus = undefined;
        });
    }
    else socket.disconnect();
});

io.on('connection', function (socket) {


    socket.admin = !(sockets.length > 0);

    initSocket(socket);
    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });





    socket.on("setFurnaceTemp",function(temp)
    {
        socket.get(("admin"),function(err,isAdmin)
            {
                if (isAdmin)
                {
                    desiredTemperature = temp;
                    broadcast("updateSetTemp",temp);
                }
                else socket.emit("notAdmin");
            });

    });


  });


function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

function initSocket(socket) {
    socket.emit("adminStatus",socket.admin);
    socket.emit("weatherUpdate",serviceCache);
    socket.emit("internalTemperature",internalTemperature);
    socket.emit("desiredTemperature",desiredTemperature);
    // socket.emit("furnaceStatus",)
}


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("server listening at", addr.address + ":" + addr.port);
});









//Class.prototype.temp = function(temp) {
//    if(temp < desiredTemperature - hysteresis ) {
//        this.emit("run");
//    }
//    else if(temp > desiredTemperature + hysteresis) {
//        this.emit("stop");
//    }
//};
//
