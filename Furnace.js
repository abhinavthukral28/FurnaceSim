/**
 * This file is a self contained node application, that connects to a thermostat's (thermostat.js) furnace
 * namespace.
 */


var thermostat = require('socket.io-client')("https://localhost:3000/furnace");

//Furnace is off by default
var furnaceIsOn = false;

//Listens for a socket event to start the furnace.
//Sends the thermostat a socket event when it is successfully running.
thermostat.on("run",function()
{
    furnaceIsOn = true;
    thermostat.emit("running");
});


//Listens for a socket event to stop the furnace.
//Sends the thermostat a socket event when it has successfully stopped.
thermostat.on("stop",function(){
    furnaceIsOn = false;
    thermostat.emit("stopping");
});






