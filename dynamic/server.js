const { Server, ServerCredentials, loadPackageDefinition} = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')

const packageDef = protoLoader.loadSync('../hello.proto', {})
const packageObj = loadPackageDefinition(packageDef)

function sayHello(call, callback) {
    callback(null, { message: 'Hello ' + call.request.name })
}

const server = new Server()
server.addService(packageObj.Greeter.service, { sayHello })
server.bindAsync('0.0.0.0:5005', ServerCredentials.createInsecure(), (error, port) => {
    console.log(error ? error.message : 'Server listening on port ' + port)
})
