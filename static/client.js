const { credentials } = require('@grpc/grpc-js')
const { GreeterClient } = require('./hello_grpc_pb')
const { HelloRequest } = require('./hello_pb')

const client = new GreeterClient('localhost:5005', credentials.createInsecure())
const request = new HelloRequest()
request.setName('static')

client.sayHello(request, (error, response) => {
    console.log(error ? error : response.getMessage())
})