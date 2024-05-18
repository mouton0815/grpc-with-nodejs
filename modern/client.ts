import { credentials, ServiceError } from '@grpc/grpc-js'
import { GreeterClient, HelloReply, HelloRequest } from './hello'

const client = new GreeterClient('localhost:5005', credentials.createInsecure())
const request = HelloRequest.create({ name: 'modern' })

client.sayHello(request, (error : ServiceError, response : HelloReply) => {
    console.log(error ? error.message : response.message)
})