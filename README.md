🌈🌈🌈 这是用Node.js编写的Apollo（配置中心）客户端

## Introduction

[Apollo（阿波罗）](https://github.com/ctripcorp/apollo)是携程框架部门研发的分布式配置中心，能够集中化管理应用不同环境、不同集群的配置，配置修改后能够实时推送到应用端，并且具备规范的权限、流程治理等特性，适用于微服务配置管理场景。
本项目为Nodejs的typescript客户端。


## apollo 服务端测试环境:
Examples 使用下面的环境作为测试服务，可直接运行。

- http://106.54.227.205
- User/Password: apollo/admin

## Features
- 配置热更新
- 缓存配置到内存
- 灰度发布
- 支持 TypeScript

## Install

```shell
npm i ctrip-apollo-client-ts
# or 
yarn install --dev ctrip-apollo-client-ts
```


## Links

- [package](https://www.npmjs.com/package/ctrip-apollo-client-ts)

## Examples

- [ts-demo](https://github.com/wangliguo6666/ctrip-apollo-client-ts/tree/master/example)

## [License](https://github.com/wangliguo6666/ctrip-apollo-client-ts/blob/master/LICENSE)

MIT
