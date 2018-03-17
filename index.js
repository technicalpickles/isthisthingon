const os = require('os')
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
var mqttClient = mqtt.connect(mqttHost, clientOptions)
topicNamespace = process.env.MQTT_NAMESPACE || os.hostname()

function publish(topic, message, options) {
  topic = topicNamespace + "/" + topic
  console.log("publish " + topic + ": " + message)
  mqttClient.publish(topic, message, options)
}

var cameraNames = process.env.CAMERA_NAMES.split(",")
console.log(cameraNames)

Tail = require('tail-forever')
 
var tail = new Tail(process.env.HOME + "/Library/Logs/Micro\ Snitch.log")
var cameras = {}

tail.on("line", function(line) {
  // example lines:
  // Mar 16, 2018 at 9:20:58 PM: Video Device became active: FaceTime HD Camera (Display)
  // Mar 16, 2018 at 9:21:13 PM: Video Device became inactive: FaceTime HD Camera (Display)
  var match = line.match(/^(.*): Video Device became (active|inactive): (.*)/)
  if (match) {
    var camera = match[3]
    var status = match[2] == 'active' ? true : false

    cameras[camera] = status
    console.log(cameras)

    var anyOn = cameraNames.some(function (name) { return cameras[name] })

    console.log("Any on: " + anyOn)
    var message = anyOn ? 'on' : 'off'
    publish("desk-cameras/state", message, {retain: true})
  } else {
    console.log("unrecognized: " + line)
  }
});

tail.on("error", function(error) {
  console.log('ERROR: ', error)
});
