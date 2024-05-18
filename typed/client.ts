import { credentials, ServiceError } from '@grpc/grpc-js'
import { GreeterClient } from './hello_grpc_pb'
import { HelloReply, HelloRequest } from './hello_pb'

const client = new GreeterClient('localhost:5005', credentials.createInsecure())
const request = new HelloRequest()
request.setName('typed')

client.sayHello(request, (error : ServiceError, response : HelloReply) => {
    console.log(error ? error.message : response.getMessage())
})