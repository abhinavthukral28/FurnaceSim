
var thermostat = require('socket.io-client')("https://localhost:3000/furnace");


var furnaceIsOn = false;

thermostat.on("run",function()
{
    furnaceIsOn = true;
    thermostat.emit("running");
});

thermostat.on("stop",function(){
    furnaceIsOn = false;
    thermostat.emit("stopping");
});






