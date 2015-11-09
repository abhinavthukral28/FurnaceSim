Welcome to Furnace Simulator!

Authors
- Abhinav Thukral
- Allan Joshua Luke

To get started run the following commands:

npm install

node furnace.js

Now open another shell and run:

node thermostat.js

This is an internet of things project which connects a thermostat to a furnace.

The thermostat acts as a server and connects to the furnace using secure web sockets(wss protocol). (Prof. Nel has permitted us to use secure web sockets(wss) in place of https)

The web client connects to the server using https. The certificates used are available in the ssl folder.

You can then visit the app on https://localhost:3000.

The page will provide the following information:

- If the furnace is on or off

- Temperature outside wherever the thermostat is located (By default Ottawa). The thermostat queries the open weather API and if the temperature changes it updates the client. (For the API poll implementation refer to the WeatherService.js located in the utils folder)

- The temperature of the building (Current temperature)

- The set temperature of the thermostat

The page allows only the first connected client to control the temperature. All the clients that connect afterwards can only monitor the system.   

The best way to see the functionality is to open 2 browser clients side by side and see the changes synchronize.
The client UI is mobile friendly.
