

var Furnace = function (therm)
{
    var furnaceIsOn = false;

    therm.on("run", function() {
        furnaceIsOn = true;
        console.log("Furnace: ON");
    });
    therm.on("stop", function() {
        furnaceIsOn = false;
        console.log("Furnace: OFF");
    });

    this.isON = function ()
    {
        return furnaceIsOn;
    };


};

module.exports = Furnace;


