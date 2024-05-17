import { sendUnaryData, Server, ServerCredentials, ServerUnaryCall } from '@grpc/grpc-js'
import { GreeterService, HelloReply, HelloRequest } from './hello'

function sayHello(call: ServerUnaryCall<HelloRequest, HelloReply>, callback: sendUnaryData<HelloReply>) {
    callback(null, HelloReply.create({ message: 'Hello ' + call.request.name }))
}

const server = new Server()
server.addService(GreeterService, { sayHello })
server.bindAsync('0.0.0.0:5005', ServerCredentials.createInsecure(), (error, port) => {
    console.log(error ? error.message : 'Server listening on port ' + port)
})
