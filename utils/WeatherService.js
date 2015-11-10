/**
 * This file is used to communicate with openweathermap api.
 *
 * It polls the api for changes and sends an update event if there are changes.
 * The current poll interval is 20 minutes.
 */

//appID required for openweathermap
var appID = "03619bf86cab5fbd4896dc3696876ed6";
var http = require("http");
var util = require('util'); //needed for inherits
var EventEmitter = require('events').EventEmitter;

var cache;

//The city used by default is ottawa.
var defaultCity = "ottawa";

//20 minutes
var interval = 1000 * 60 * 20;



var thisService;

var Class = function() {

};

util.inherits(Class, EventEmitter);

//Waits for a start command before it begins polling the openweathermap api.
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


    //http request for getting the weather in metric units.
    var options = {
        host: 'api.openweathermap.org',
        path: '/data/2.5/weather?q=' + city +
        '&appid='+appID +'&units=metric'
    };
    //Sends the request, and throws an event if there was a change in weather.
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



//Builds the response from the openweathermap api request
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