$(document).ready(function() {
  $('#adminStuff').hide();
});
var socket = io.connect("https://localhost:3000/client");
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
socket.on('weatherUpdate', function (data) {
  var obj = JSON.parse(data);
  var icon = getWeaterIcon(obj.weather[0].icon);
  var temp = obj.main.temp;
  var city = obj.name;
  var description = obj.weather[0].main;

  $("#outsideTemperature").html(temp);
  $("#weatherDescription").html(description);
  $("#weatherIconDisplay").html("<h4 data-icon=" + icon + "></h4>");
  $("#city").html(city);
})
socket.on('internalTemperature', function (data) {
  $("#currentTemperature").html(data);
})
socket.on('desiredTemperature', function (data) {
  $("#setTemperature").html(data);
  console.log("THis is thte data " + data);
  $("#tempSlider").val(data);
})
socket.on('updateSetTemp', function (data) {
  $("#setTemperature").html(data);
  console.log(data);
  $("#tempSlider").val(data);
  Materialize.toast('Set Temperature Updated by Admin', 2000);

})
socket.on('furnaceStatus', function (data) {
  console.log("furnace" + data);
  if(data === true){
    $("#furnaceStatus").html("ON");
    Materialize.toast('Furance ON', 2000);
  }
  else if (data === "none") {
    $("#furnaceStatus").html("No Furnace Found");
  }
  else if (data === false) {
    $("#furnaceStatus").html("OFF");
    Materialize.toast('Furance OFF', 2000);
  }
})

function updataSetTemp(value){
  $("#setTemperature").html(value);
  newTemp = value;

}
function setNewTemperature() {
  console.log("got here");
  socket.emit('setFurnaceTemp', newTemp);
  Materialize.toast('New Furance Temperature Set', 2000);
}
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
