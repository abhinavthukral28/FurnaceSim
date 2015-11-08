$(document).ready(function() {
  $('#adminStuff').hide();
});
var socket = io.connect();
var isAdmin = false;
var newTemp = null;
socket.on('adminStatus', function (data) {
  if(data === true){
    console.log(data);
    isAdmin = true;
    $('#adminStuff').show();
  }
});
socket.on('weatherUpdate', function (data) {
  $("#outsideTemperature").html(data);
  console.log(data);
})
socket.on('internalTemperature', function (data) {
  $("#currentTemperature").html(data);
})
socket.on('desiredTemperature', function (data) {
  $("#setTemperature").html(data);
  console.log(data);
  $("#tempSlider").val(data);
})
socket.on('updateSetTemp', function (data) {
  $("#setTemperature").html(data);
  console.log(data);
  $("#tempSlider").val(data);
})

function updataSetTemp(value){
  $("#setTemperature").html(value);
  newTemp = value;

}
function setNewTemperature() {
  console.log("got here");
  socket.emit('setFurnaceTemp', newTemp);
}
