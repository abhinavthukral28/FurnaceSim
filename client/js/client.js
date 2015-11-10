$(document).ready(function() {
  $('#adminStuff').hide();
});
// connect to the server socket
var socket = io.connect(window.location.href + "client");
var isAdmin = false;
var newTemp = null;
socket.on('adminStatus', function (data) {
  if(data === true){
    console.log(data);
    isAdmin = true;
    $('#adminStuff').show();
    $('#notAdmin').hide();

  }
});
/*
socket event received from the server on change in outside weather.
The data object received is the raw data received by the thermostat server on making a request from the open weather API
*/
socket.on('weatherUpdate', function (data) {
  var obj = JSON.parse(data); //Parse JSON data
  var icon = getWeaterIcon(obj.weather[0].icon);//Mapping the weather icon received from the api to the icon web font
  var temp = parseInt(obj.main.temp); //Getting temperature from raw API data
  var city = obj.name;  //Getting the city name
  var description = obj.weather[0].main; //Getting weather description

  $("#outsideTemperature").html(temp);
  $("#weatherDescription").html(description);
  $("#weatherIconDisplay").html("<h4 data-icon=" + icon + "></h4>"); //Applying the webfont icon
  $("#city").html(city);
});
/*
Socket event received on change in temperature at the thermostat's location
*/
socket.on('internalTemperature', function (data) {
  $("#currentTemperature").html(data);
});
/*
Socket event informing the client of the current desired temperature
*/
socket.on('desiredTemperature', function (data) {
  $("#setTemperature").html(data);
  $("#tempSlider").val(data);
});
/*
Socket event received when the set Temperature is updated by admin
*/
socket.on('updateSetTemp', function (data) {
  $("#setTemperature").html(data);
  console.log(data);
  $("#tempSlider").val(data);
  Materialize.toast('Set Temperature Updated by Admin', 2000);

});
/*
Socket event received when the furnace is switched on or off
*/
socket.on('furnaceStatus', function (data) {
  console.log("furnace" + data);
  if(data === true){
    $("#furnaceStatus").html("ON");
    Materialize.toast('Furnace ON', 2000);
  }
  else if (data === "none") {
    $("#furnaceStatus").html("No Furnace Found");
  }
  else if (data === false) {
    $("#furnaceStatus").html("OFF");
    Materialize.toast('Furnace OFF', 2000);
  }
});
/*
Funtion to get the value set by the user on the slider
*/
function updataSetTemp(value){
  $("#setTemperature").html(value);
  newTemp = value;

};
/*
Function to set the new thermostat temperature
*/
function setNewTemperature() {
  console.log("got here");
  socket.emit('setFurnaceTemp', newTemp);
  Materialize.toast('New Furance Temperature Set', 2000);
};
/*
Funtion to map the weather icons to the web font
*/
function getWeaterIcon(icon){
  var iconMap = {};
  //Day Icons Map
  iconMap["01d"] = "1";
  iconMap["02d"] = "3";
  iconMap["03d"] = "5";
  iconMap["04d"] = "%";
  iconMap["09d"] = "8";
  iconMap["10d"] = "7";
  iconMap["11d"] = "&";
  iconMap["13d"] = "#";
  iconMap["50d"] = "M";
  //Night Icons Map
  iconMap["01n"] = "2";
  iconMap["02n"] = "4";
  iconMap["03n"] = "5";
  iconMap["04n"] = "%";
  iconMap["09n"] = "8";
  iconMap["10n"] = "7";
  iconMap["11n"] = "&";
  iconMap["13n"] = "#";
  iconMap["50n"] = "M";
  return iconMap[icon];
}
