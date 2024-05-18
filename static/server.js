const { Server, ServerCredentials } = require('@grpc/grpc-js')
const { GreeterService } = require('./hello_grpc_pb')
const { HelloReply } = require('./hello_pb')

function sayHello(call, callback) {
    const reply = new HelloReply()
    reply.setMessage('Hello ' + call.request.getName())
    callback(null, reply)
}

const server = new Server()
server.addService(GreeterService, { sayHello })
server.bindAsync('0.0.0.0:5005', ServerCredentials.createInsecure(), (error, port) => {
    console.log(error ? error.message : 'Server listening on port ' + port)
})
