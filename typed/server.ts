import { sendUnaryData, Server, ServerCredentials, ServerUnaryCall } from '@grpc/grpc-js'
import { GreeterService } from './hello_grpc_pb'
import { HelloReply, HelloRequest } from './hello_pb'

function sayHello(call: ServerUnaryCall<HelloRequest, HelloReply>, callback: sendUnaryData<HelloReply>) {
    const reply = new HelloReply()
    reply.setMessage('Hello ' + call.request.getName())
    callback(null, reply)
}

const server = new Server()
server.addService(GreeterService, { sayHello })
server.bindAsync('0.0.0.0:5005', ServerCredentials.createInsecure(), (error, port) => {
    console.log(error ? error.message : 'Server listening on port ' + port)
})
