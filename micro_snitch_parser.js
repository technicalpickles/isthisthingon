const EventEmitter = require('events')
const Tail = require('tail-forever')

class MicroSnitchParser extends EventEmitter {
  constructor(path) {
    super()
    this.path = path

    this.tail = new Tail(path)
    this.tail.on('line', (line) => {
      this.parseLine(line)
    })
    this.tail.on("error", (error) => {
      this.emit('error', error)
    });
  }

  parseLine(line) {
    // example lines:
    // Mar 16, 2018 at 9:20:58 PM: Video Device became active: FaceTime HD Camera (Display)
    // Mar 16, 2018 at 9:21:13 PM: Video Device became inactive: FaceTime HD Camera (Display)
    var match = line.match(/^(.*): Video Device became (active|inactive): (.*)/)
    if (match) {
      var camera = match[3]
      var status = match[2] == 'active' ? true : false

      this.emit('status', camera, status)
    }
  }
}

module.exports = MicroSnitchParser
