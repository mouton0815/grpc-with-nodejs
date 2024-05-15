import { credentials } from '@grpc/grpc-js'
import { GreeterClient } from './hello_grpc_pb'
import { HelloRequest } from './hello_pb'

const client = new GreeterClient('localhost:5005', credentials.createInsecure())
const request = new HelloRequest()
request.setName('Hans')

client.sayHello(request, (error, response) => {
    console.log(error ? error.message : response.getMessage())
})