var proxy = require("proxy-stream")
    , to = require("write-stream")

module.exports = flatten

function flatten(stream) {
    var toBuffer = to(addToBuffer)
        , buffer = []

    return proxy(stream, write, read, stream.end, [pipeWrite])

    function write(other) {
        return other.pipe(stream)
    }

    function read(bytes, buffer) {
        var other = stream.read(bytes)
        if (other) {
            other.pipe(toBuffer, { end: false })
        }
        return buffer.shift()
    }

    function addToBuffer(chunk) {
        buffer.push(chunk)
        if (buffer.length === 1) {
            stream.emit("readable")
        }
    }

    function pipeWrite(other, buffer) {
        var stream = this
        other.pipe(to(intoBuffer))

        function intoBuffer(chunk) {
            buffer.push(chunk)
            if (buffer.length === 1) {
                stream.emit("readable")
            }
        }
    }
}