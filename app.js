const os = require('os')
const mqtt = require('mqtt')
const wifi = require('node-wifi')
require('dotenv').config()
const MqttPublisher = require('./mqtt_publisher')
const MicroSnitchParser = require('./micro_snitch_parser')

wifi.init({
    iface : null // network interface, choose a random wifi interface if set to null
});

wifi.getCurrentConnections(function(err, currentConnections) {
    if (err) {
        console.log(err);
    }

    console.log(currentConnections);
});

var namespace = process.env.MQTT_NAMESPACE || os.hostname()
var publisher = new MqttPublisher(process.env.MQTT_HOST, process.env.MQTT_USERNAME, process.env.MQTT_PASSWORD, namespace)

var cameraNames = process.env.CAMERA_NAMES.split(",")
console.log(cameraNames)

var parser = new MicroSnitchParser(process.env.HOME + "/Library/Logs/Micro\ Snitch.log")
var cameras = {}

parser.on("status", function(camera, status) {
  cameras[camera] = status
  var anyOn = cameraNames.some(function (name) { return cameras[name] })

  console.log("Any on: " + anyOn)
  var message = anyOn ? 'on' : 'off'
  publisher.publish("desk-cameras/state", message, {retain: true})
});

parser.on("error", function(error) {
  console.log('ERROR: ', error)
})
