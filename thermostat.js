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

var socketCount = 0;


var furnaceNSP = io.of("/furnace");
furnaceNSP.on("connection",function(socket){



  if (furnaceStatus == undefined) {
    socket.on("running", function () {
      furnaceStatus = true;
      socket.broadcast.emit("furnaceStatus",true);
    });

    socket.on("stopping", function () {
      furnaceStatus = false;
      socket.broadcast.emit("furnaceStatus",false);
    });

    socket.on("disconnect", function () {
      furnaceStatus = undefined;
      socket.broadcast.emit("furnaceStatus","none");
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

  socketCount++;
  socket.admin = (socketCount == 1);

  initSocket(socket);


  socket.on('disconnect', function () {
    socketCount--;
  });





  socket.on("setFurnaceTemp",function(temp)
  {
    if(socket.admin){
      desiredTemperature = parseInt(temp);
      console.log(desiredTemperature);
      socket.broadcast.emit("updateSetTemp",temp);
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
    else internalTemperature--;


    io.of("/client").emit("internalTemperature", internalTemperature);

    if(internalTemperature < desiredTemperature - hysteresis ) {
      furnaceNSP.emit("run");
    }
    else if(internalTemperature  > desiredTemperature + hysteresis) {
      furnaceNSP.emit("stop");
    }


    console.log('TEMP: ' + internalTemperature);

    setTimeout(again, 1000); //recursively restart timeout

  }, 1000);

}





