const { credentials, loadPackageDefinition } = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')

const packageDef = protoLoader.loadSync('../hello.proto', {})
const packageObj = loadPackageDefinition(packageDef)

const client = new packageObj.Greeter('localhost:5005', credentials.createInsecure())
const request = { name: 'dynamic' }

client.sayHello(request, (error, response) => {
    console.log(error ? error : response.message)
})