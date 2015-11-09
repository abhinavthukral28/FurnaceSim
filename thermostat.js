var https = require('https');
var express = require("express");
var app = express();
var router = express.Router();
var fs = require('fs');
var path = __dirname + '/client/';
var options = {
  key: fs.readFileSync('ssl/serverkey.pem'),
  cert: fs.readFileSync('ssl/servercert.crt')
};
var server = https.createServer(options, app);
var io = require('socket.io')(server);
var WeatherService = require("./utils/WeatherService.js");




app.use(express.static('client'));

weatherService = new WeatherService();


var hysteresis = 2.5; //thermostat hysteresis
var desiredTemperature = 20; //desired room temperature


var outsideTemperature;
var internalTemperature = 15;

var serviceCache;

var furnaceStatus = undefined;


var clients = [];
var adminConnected = false;


var furnaceNSP = io.of("/furnace");
furnaceNSP.on("connection",function(socket){



  if (furnaceStatus == undefined) {
    furnaceStatus = false;
    socket.on("running", function () {
      furnaceStatus = true;
      io.of("/client").emit("furnaceStatus",true);
    });

    socket.on("stopping", function () {
      furnaceStatus = false;
      io.of("/client").emit("furnaceStatus",false);
    });

    socket.on("disconnect", function () {
      furnaceStatus = undefined;
      io.of("/client").emit("furnaceStatus","none");
    });
  }
  else socket.disconnect();
});


weatherService.on("weatherUpdate",function(data){

  var json = JSON.parse(data);

  outsideTemperature = json["main"].temp;


  serviceCache = data;

  io.emit('weatherUpdate', data);


});

weatherService.start();
startTempSim();

io.of("/client").on('connection', function (socket) {

clients.push(socket);

  if (!adminConnected) {
    socket.admin = true;
    adminConnected = true;
  }
  else
    socket.admin = false;

  initSocket(socket);


  socket.on('disconnect', function () {

    clients.splice(clients.indexOf(socket), 1);
      if (socket.admin)
      {
        clients[0].admin = true;
        clients[0].emit("adminStatus",true);
      }
  });





  socket.on("setFurnaceTemp",function(temp)
  {
    if(socket.admin){
      desiredTemperature = parseInt(temp);
      console.log(desiredTemperature);
      io.of("/client").emit("updateSetTemp",temp);
    }

  });


});



function initSocket(socket) {
  socket.emit("adminStatus", socket.admin);
  socket.emit("weatherUpdate", serviceCache);
  socket.emit("internalTemperature", internalTemperature);
  socket.emit("desiredTemperature", desiredTemperature);
  socket.emit("furnaceStatus",furnaceStatus == undefined ? "none" : furnaceStatus);
}
server.listen(3000, function () {
  console.log("Server listening on port 3000");
});

function startTempSim()
{


  setTimeout( function again(){



    if(furnaceStatus) internalTemperature++;
    else if (outsideTemperature < internalTemperature) internalTemperature--;


    io.of("/client").emit("internalTemperature", internalTemperature);


    if(internalTemperature < desiredTemperature - hysteresis ) {
      furnaceStatus ? "" : furnaceNSP.emit("run");
    }
    else if(internalTemperature  > desiredTemperature + hysteresis) {
      !furnaceStatus ? "" : furnaceNSP.emit("stop");
    }


    console.log('TEMP: ' + internalTemperature);

    setTimeout(again, 1000); //recursively restart timeout

  }, 1000);

}
