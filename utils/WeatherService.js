


var appID = "03619bf86cab5fbd4896dc3696876ed6";
var http = require("http");
var util = require('util'); //needed for inherits
var EventEmitter = require('events').EventEmitter;

var cache;

var defaultCity = "ottawa";

//20 minutes
var interval = 1000 * 60 * 20;



var thisService;

var Class = function() {

};

util.inherits(Class, EventEmitter);

Class.prototype.start = function (city)
{
    if (city != undefined)
    {
        defaultCity = city;
    }

    thisService = this;
    this.getWeather(defaultCity);
    setInterval(function(){Class.prototype.getWeather(defaultCity);}, interval);
};


//from 07_weather_service.js
Class.prototype.getWeather = function (city){



    var options = {
        host: 'api.openweathermap.org',
        path: '/data/2.5/weather?q=' + city +
        '&appid='+appID
    };
    http.request(options, function(weatherResponse){
        var weather = parseWeather(weatherResponse,function callback(weather)
        {
            if (weather != cache) {
                cache = weather;
                thisService.emit("weatherUpdate", weather);
            }
        });


    }).end();
};




function parseWeather(weatherResponse,callback) {
    var weatherData = '';
    weatherResponse.on('data', function (chunk) {
        weatherData += chunk;
    });
    weatherResponse.on('end', function () {
       callback(weatherData);

    });
}



module.exports = Class;