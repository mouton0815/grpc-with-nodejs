# gRPC with Node.js
## Four Ways of Integrating gRPC into your Node.js Project
When I first started using gRPC for Node.js, I quickly became very confused.
There seemed to be a plethora of ways to integrate gRPC into clients and servers,
and every article I read suggested a slightly different approach.
Moreover, some of the approaches did not work at first, sometimes because of a missing flag,
sometimes because I confused local and global installations. I was pretty demotivated.

Later I tried to approach the matter more systematically.
The more I understood, the more I wanted to write a short blog post about my findings.
And here it is.

((TODO: `protoc` installation (there might be variants)))
((TODO: Say that only client-stub examples are shown, but that the GitHub repo also shows the servers))

Before I discovered [ts-proto](https://github.com/stephenh/ts-proto) for JavaScript code generation,
I tried a number of other approaches found in the official documentation and in articles:

### Dynamic Generation
The [gRPC home page](https://grpc.io/docs/languages/node/basics/) proposes to load the `.proto` files into the
target application, and generate service descriptors and client stub definitions dynamically using
[@grpc/grpc-js](https://www.npmjs.com/package/@grpc/grpc-js) and [@grpc/proto-loader](https://www.npmjs.com/package/@grpc/proto-loader).
This approach is also used in several articles, such as
[How to Build Your First Node.js gRPC API](https://www.trendmicro.com/en_us/devops/22/f/grpc-api-tutorial.html).

```shell
nom install @grpc/grpc-js @grpc/proto-loader
```
((TODO: Code example?))

However, I didn't want to have my skeletons and stubs to be auto-generated,
because I wanted a dedicated code-generation step, clearly separated from actual code usage.
Moreover, I wanted to use the same approach for different languages, such as Go.

### Static Generation with `grpc-tools`
The Protocol Buffer compiler [protoc](https://grpc.io/docs/protoc-installation/) directly supports the generation
of JavaScript code with flag `--js_out`, given that [protoc-gen-js](https://www.npmjs.com/package/protoc-gen-js) is globally installed:
```shell
npm install -g protoc-gen-js
```
Then the Protocol Buffers can be generated as follows:
```shell
protoc --js_out=import_style=commonjs,binary:. --proto_path=.. hello.proto
```
To additionally generate gRPC skeletons and stubs, `protoc` needs a plugin
(this holds for all approaches described in the following).
A usual choice is plugin `grpc_tools_node_protoc_plugin` that comes
with package [grpc-tools](https://www.npmjs.com/package/grpc-tools)
of project [grpc-node](https://github.com/grpc/grpc-node):
```shell
npm install -D grpc-tools
```
The plugin can be passed to the compiler as follows:
```shell
protoc --js_out=import_style=commonjs,binary:. --grpc_out=grpc_js:. --plugin=protoc-gen-grpc=node_modules/grpc-tools/bin/grpc_node_plugin --proto_path=.. hello.proto
```
Fortunately, there is a simpler variant: `grpc-tools` also comes with a script `grpc_tools_node_protoc`
that can be used instead of `protoc`. The script delegates to `protoc` under the hood.
No separate installation is required, because `grpc-tools` ships with `protoc`.
Also, `protoc-gen-js` does not need to be installed separately, because code generation for Protocol Buffers is included.

The compiler call simplifies to:
```shell
npx grpc_tools_node_protoc --js_out=import_style=commonjs,binary:. --grpc_out=grpc_js:. --proto_path=.. hello.proto 
```
`protoc` can output code that uses either closure-style or CommonJS-style imports (as used in the calls above).
The [project page](https://github.com/protocolbuffers/protobuf-javascript) states that
> Support for ES6-style imports is not implemented yet.

This leads to generated code that is hard to read for users of modern JavaScript.
Moreover, the generated CommonJS code cannot be easily combined with ([ECMAScript modules](https://nodejs.org/api/esm.html)
(i.e. projects specified as `"type": "module"` in the `package.json`).
For this reason, the example client below also uses the CommonJS format:

```javascript
const { credentials } = require('@grpc/grpc-js')
const { GreeterClient } = require('./hello_grpc_pb')
const { HelloRequest } = require('./hello_pb')

const client = new GreeterClient('localhost:5005', credentials.createInsecure())
const request = new HelloRequest()
request.setName('Hans')

client.sayHello(request, (error, response) => {
    console.log(error ? error.message : response.getMessage())
})
```
In order to build and run the client, another dependency must be added to your project:
```shell
npm add google-protobuf
```
An escape from downgrading an entire project to CommonJS is using a preprocessor. 
A TypeScript compiler is one possible preprocessor. 
This is the approach chosen in article [Creating a gRPC server and client with Node.js and TypeScript](https://medium.com/nerd-for-tech/creating-a-grpc-server-and-client-with-node-js-and-typescript-bb804829fada).
It also describes the plugin syntax of `protoc` in more detail.

### TypeScript Signature Generation with `protoc-gen-grpc`
An alternative to `grpc-tools` is [protoc-gen-grpc](https://www.npmjs.com/package/protoc-gen-grpc),
which also ships with `protoc` and all required plugins:
```shell
npm install -D protoc-gen-grpc
```
The argument syntax is very similar to `grpc_tools_node_protoc`,
and much simplified compared to the direct call to `protoc` (no need to provide a `--plugin` option): 
```shell
npx protoc-gen-grpc --js_out=import_style=commonjs,binary:. --grpc_out=grpc_js:. --proto_path=.. hello.proto
```
Under the hood, `protoc-gen-grpc` delegates its arguments to `protoc`and passes its code-generation plugin.

While the packaging of programs is a nice benefit of `protoc-gen-grpc`, the main advantage is
its ability to generate TypeScript signatures:
```shell
npx protoc-gen-grpc-ts --ts_out=grpc_js:. --proto_path=.. hello.proto
```
This simplifies the integration of the generated code into TypeScript clients:
```typescript
import { credentials } from '@grpc/grpc-js'
import { GreeterClient } from './hello_grpc_pb'
import { HelloRequest } from './hello_pb'

const client = new GreeterClient('localhost:5005', credentials.createInsecure())
const request = new HelloRequest()
request.setName('Hans')

client.sayHello(request, (error, response) => {
    console.log(error ? error.message : response.getMessage())
})
```

### Native TypeScript Generation with `ts-proto`
All variants discussed so far use the built-in JavaScript generation of `protoc`,
with the consequence that the output format is ancient CommonJS (although optionally with TypeScript signatures).

Project [ts-proto](https://github.com/stephenh/ts-proto) goes a radically different way
and replaces the built-in CommonJS generator by a TypeScript generator.
The generated code varies substantially from the [protobufjs](https://www.npmjs.com/package/protobufjs)-based code,
with incompatible signatures of the exported types and functions (for example, there are no getters and setters, just fields).

The increased cleanness of the generated code makes the integration into your target projects simpler,
but there is also a risk in becoming too dependent on `ts-proto`.

Only one package needs to be installed:
```shell
npm install -D ts-proto
```
The generator is passed as plugin to `protoc`.
It provides a wealth of extra options, including one that generates gRPC service definitions and stubs:

```shell
protoc --plugin=node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=. --ts_proto_opt=outputServices=grpc-js --proto_path=.. hello.proto
```
All code is written to one idiomatic Typescript file.

The corresponding integration into code is even simpler as in the example above (note the `create` factory):
```typescript
import { credentials } from '@grpc/grpc-js'
import { GreeterClient, HelloRequest } from './hello'

const client = new GreeterClient('localhost:5005', credentials.createInsecure())
const request = HelloRequest.create({ name: 'Hans' })

client.sayHello(request, (error, response) => {
    console.log(error ? error.message : response.message)
})
```
Unfortunately, the generated functions still use callbacks.
A promise-based API would be more elegant and would fit better with the clean Typescript approach.

Many more details of creating gRCP server and client applications with `ts-proto` are provided
by article [NodeJS Microservice with gRPC and TypeScript](https://rsbh.dev/blogs/grpc-with-nodejs-typescript).