const os = require('os')
const { exec } = require('child_process')
const mqtt = require('mqtt')
const wifi = require('node-wifi')
require('dotenv').config()

wifi.init({
    iface : null // network interface, choose a random wifi interface if set to null
});

wifi.getCurrentConnections(function(err, currentConnections) {
    if (err) {
        console.log(err);
    }

    console.log(currentConnections);
});

var mqttHost = process.env.MQTT_HOST
var clientOptions = {
  port: 1883,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  rejectUnauthorized: false
}
var mqttClient = mqtt.connect(mqttHost, clientOptions)
topicNamespace = process.env.MQTT_NAMESPACE || os.hostname()

var cameraNames = process.env.CAMERA_NAMES.split(",")
console.log(cameraNames)

function publish(topic, message, options) {
  topic = topicNamespace + "/" + topic
  console.log("publish " + topic + ": " + message)
  mqttClient.publish(topic, message, options)
}
 
const MicroSnitchParser = require('./micro_snitch_parser')
var parser = new MicroSnitchParser(process.env.HOME + "/Library/Logs/Micro\ Snitch.log")
var cameras = {}

parser.on("status", function(camera, status) {
  cameras[camera] = status
  var anyOn = cameraNames.some(function (name) { return cameras[name] })

  console.log("Any on: " + anyOn)
  var message = anyOn ? 'on' : 'off'
  publish("desk-cameras/state", message, {retain: true})
});

parser.on("error", function(error) {
  console.log('ERROR: ', error)
})
