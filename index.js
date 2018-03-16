
const { exec } = require('child_process')
const mqtt = require('mqtt')
require('dotenv').config()

exec('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I', (err, stdout, stderr) => {
  if (err) {
    return
  }

  var lines = stdout.split("\n")
  var attributes = {}
  for (line of stdout.split("\n")) {
    var match = line.match(/\s*(.*): (.*)/)
    if (match) {
      attributes[match[1]] = match[2]
    }
  }

  console.log("SSID: " + attributes["SSID"])
})

var mqttHost = process.env.MQTT_HOST
var clientOptions = {
  port: 1883,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  rejectUnauthorized: false
}
console.log(mqttHost)
console.log(clientOptions)
var mqttClient = mqtt.connect(mqttHost, clientOptions)
topicNamespace = "picklebook-pro"

function publish(topic, message, options) {
  topic = topicNamespace + "/" + topic
  console.log("publish " + topic + ": " + message)
  mqttClient.publish(topic, message, options)
}

Tail = require('tail-forever')
 
var tail = new Tail("/Users/technicalpickles/Library/Logs/Micro\ Snitch.log")
var cameras = {}

function deskCameraOn() { 
  return cameras["FaceTime HD Camera (Display)"] || cameras["FaceTime HD Camera (Display) #2"] || false
}

tail.on("line", function(line) {
  var match = line.match(/^(.*): Video Device became (active|inactive): (.*)/)
  if (match) {
    var camera = match[3]
    var status = match[2] == 'active' ? true : false

    cameras[camera] = status
    console.log(cameras)

    var anyOn = deskCameraOn()
    console.log("Any on: " + anyOn)
    var message = anyOn ? 'on' : 'off'
    publish("desk-cameras/state", message, {retain: true})
  }
});

tail.on("error", function(error) {
  console.log('ERROR: ', error)
});
