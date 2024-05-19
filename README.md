<img src="grpc-wth-node.png" alt="gRCP with Node" style="width:600px;"/>

# Four Ways of Integrating gRPC into your Node.js Project

This project contains the source code for my Medium article
[gRPC with Node - Four Ways of Integrating gRPC into your Node.js](https://medium.com/@torsten.schlieder/grpc-with-node-b73f51c54b12).

The project consists for four subfolders: [dynamic](./dynamic), [static](./static), [typed](./typed), and [modern](./modern),
which are briefly described in the following sections.

All variants use the simplest possible protocol specification [hello.proto](./hello.proto):
```protobuf
syntax = "proto3";

service Greeter {
  rpc sayHello(HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
```
The client passes a simple `HelloRequest` object with a name to the server;
the server replies with a `HelloReply` object with a message `"Hello <name>"`.

## 1. Dynamic Generation with `proto-loader`
As the name suggests, this variant does not require a build step.
The `.proto` file is included into the target applications at runtime.
A protocol loader generates the service descriptors and client stubs on the fly.

```shell
cd ./dynamic
npm install
npm run server
```
In another shell:
```shell
npm run client
```

## 2. Static Generation with `grpc-tools`
Static code generation requires the protocol buffer compiler [protoc](https://grpc.io/docs/protoc-installation/)
with built-in support for JavaScript. The generation of gRPC service descriptors and client stubs additionally
needs package [grpc-tools](https://www.npmjs.com/package/grpc-tools), which comes with `protoc` and all
necessary plugins.

```shell
cd ./static
npm install
npm build
npm run server
```
The corresponding client can be started in another shell as in the first variant.

## 3. Type Signature Generation with `protoc-gen-grpc`
An alternative to `grpc-tools` is [protoc-gen-grpc](https://www.npmjs.com/package/protoc-gen-grpc), which adds support for generating TypeScript signatures.

```shell
cd ./typed
npm install
npm build
npm run server
```
The corresponding client can be started in another shell as in the first variant.

## 4. Native TypeScript Generation with `ts-proto`
The three variants discussed so far use the built-in JavaScript generation of `protoc`.
Project [ts-proto](https://github.com/stephenh/ts-proto) goes a different way and replaces the built-in CommonJS code generation
by a generator that outputs idiomatic TypeScript.

```shell
cd ./modern
npm install
npm build
npm run server
```
The corresponding client can be started in another shell as in the first variant.