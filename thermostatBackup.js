


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
var server = https.createServer(options, app)
var io = require('socket.io')(server);

var WeatherService = require("./utils/WeatherService.js");


app.use(express.static('client'));

// router.get("/", function (req,res) {
//   res.sendFile(path + "index.html")
// })
// app.use("/",router);
//
// app.use("*",function(req,res){
//   res.sendFile(path + "index.html");
// });

weatherService = new WeatherService();


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

    console.log("GOT A FURNACE!");
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
server.listen(3000, function () {
  console.log("Server listening on port 3000");
})








//Class.prototype.temp = function(temp) {
//    if(temp < desiredTemperature - hysteresis ) {
//        this.emit("run");
//    }
//    else if(temp > desiredTemperature + hysteresis) {
//        this.emit("stop");
//    }
//};
//
