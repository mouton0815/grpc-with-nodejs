import { Server, ServerCredentials } from '@grpc/grpc-js'
import { GreeterService } from './hello_grpc_pb'
import { HelloReply } from './hello_pb'

function sayHello(call, callback) {
    const reply = new HelloReply()
    reply.setMessage('Hello ' + call.request.getName())
    callback(null, reply)
}

const address = '0.0.0.0:5005'
const server = new Server()
server.addService(GreeterService, { sayHello })
server.bindAsync(address, ServerCredentials.createInsecure(), () => {
    console.log('Server listening at', address)
})
