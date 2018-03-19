const mqtt = require('mqtt')

class MqttPublisher {
  constructor(host, username, password, namespace) {
    var clientOptions = {
      port: 1883,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      rejectUnauthorized: false
    }
    this.client = mqtt.connect(host, clientOptions)
    this.namespace = namespace
  }

  publish(topic, message, options) {
    topic = this.namespace + "/" + topic
    console.log("publish " + topic + ": " + message)
    this.client.publish(topic, message, options)
  }
}

module.exports = MqttPublisher
