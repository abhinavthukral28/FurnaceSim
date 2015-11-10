/**
 * This file is the server for this application.
 *
 * The following code simulates a thermostat and provides connected clients with pertinent information.
 *
 * All web clients and Furnace clients (Furnace.js) connect to this server.
 */

var https = require('https');
var express = require("express");
var app = express();
var router = express.Router();
var fs = require('fs');
var path = __dirname + '/client/';

//SSL options
var options = {
  key: fs.readFileSync('ssl/serverkey.pem'),
  cert: fs.readFileSync('ssl/servercert.crt')
};
var server = https.createServer(options, app);
var io = require('socket.io')(server);

/**
 * Refer to WeatherService.js located in utils.
 */
var WeatherService = require("./utils/WeatherService.js");




app.use(express.static('client'));

weatherService = new WeatherService();

/**
 *  Variables required for thermostat simulation
 */
var hysteresis = 2.5; //thermostat hysteresis
var desiredTemperature = 20; //desired room temperature
var outsideTemperature;
var internalTemperature = 15;


//Stores the data retrieved by the weather service
var serviceCache;

var furnaceStatus = undefined;


var clients = [];
var adminConnected = false;

/**
 * A namepsace to group all furnace connections
 */
var furnaceNSP = io.of("/furnace");
furnaceNSP.on("connection",function(socket){



  if (furnaceStatus == undefined) {

    //Initialize the furnace to false as it is not running
    furnaceStatus = false;

    //Listens for socket event indicating that the furnace is running.
    //The furnaceStatus is updated and the furnace status is updated to all connected
    //web clients.
    socket.on("running", function () {
      furnaceStatus = true;

      io.of("/client").emit("furnaceStatus",true);
    });

    //Listens for socket event indicating that the furnace has stopped running.
    //The furnaceStatus is updated and the furnace status is updated to all connected
    //web clients.
    socket.on("stopping", function () {
      furnaceStatus = false;
      io.of("/client").emit("furnaceStatus",false);
    });

    //Listens for socket event indicating that the furnace has disconnected.
    //The furnaceStatus is updated to undefined and the status is updated to all connected web clients.
    socket.on("disconnect", function () {
      furnaceStatus = undefined;
      io.of("/client").emit("furnaceStatus","none");
    });
  }
  else socket.disconnect();
});

//Event listener for the weather service.
//The json data from the weather service is updated here.
//The local cache is updated, and is sent to all connected clients.
weatherService.on("weatherUpdate",function(data){

  var json = JSON.parse(data);

  outsideTemperature = json["main"].temp;


  serviceCache = data;

  io.emit('weatherUpdate', data);


});

//Start the weather service
weatherService.start();

//Start the temperature simulator
startTempSim();


//Namespace to store all web based clients.
//This listener waits for connections to the namespace
//The socket is initialized with all pertinent data,
//and is given admin status (ability to set desired temperature) if they are the first one or only one connected.
io.of("/client").on('connection', function (socket) {

clients.push(socket);

  if (!adminConnected) {
    socket.admin = true;
    adminConnected = true;
  }
  else
    socket.admin = false;

  initSocket(socket);

  //Listens for the client disconnection.
  //Handles how to pass admin status.
  socket.on('disconnect', function () {

    clients.splice(clients.indexOf(socket), 1);
      if (socket.admin)
      {
        if (clients.length > 0) {
          clients[0].admin = true;
          clients[0].emit("adminStatus", true);
        }
        else adminConnected = false;
      }
  });





  //Listener for socket event which sets the desiredTemperature.
  //The temperature is only set if the client is given admin status.
  //The set temperature is sent to all connected clients.
  socket.on("setFurnaceTemp",function(temp)
  {
    if(socket.admin){
      desiredTemperature = parseInt(temp);
      console.log(desiredTemperature);
      io.of("/client").emit("updateSetTemp",temp);
    }

  });


});


//A helper function to send initial data over a web client socket.
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

//A temperature simulator that simulates changes in internal temperature based on the outside temperature.
//The internal temperature is also updated to all clients.
//The furnace status is also controlled from this function.
//Function based on the implementation in T5
function startTempSim()
{

  setTimeout( function again(){



    if(furnaceStatus) internalTemperature++;
    else if (outsideTemperature < internalTemperature) internalTemperature--;


    io.of("/client").emit("internalTemperature", internalTemperature);


    //Start the furnace
    if(internalTemperature < desiredTemperature - hysteresis ) {
      furnaceStatus ? "" : furnaceNSP.emit("run");
    }
    //Stop the furnace
    else if(internalTemperature  > desiredTemperature + hysteresis) {
      !furnaceStatus ? "" : furnaceNSP.emit("stop");
    }


    console.log('TEMP: ' + internalTemperature);

    setTimeout(again, 1000); //recursively restart timeout

  }, 1000);

}
