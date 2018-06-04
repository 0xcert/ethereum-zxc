<img src="https://github.com/0xcert/ethereum-zxc/raw/master/assets/cover.png" />

![Build Status](https://travis-ci.org/0xcert/ethereum-zxc.svg?branch=master)&nbsp;[![NPM Version](https://badge.fury.io/js/@0xcert%2Fethereum-zxc.svg)](https://badge.fury.io/js/0xcert%2Fethereum-zxc)&nbsp;[![Dependencies Status](https://david-dm.org/0xcert/ethereum-zxc.svg)](https://david-dm.org/0xcert/ethereum-zxc)&nbsp;[![Bug Bounty](https://img.shields.io/badge/bounty-pending-2930e8.svg)](https://github.com/0xcert/ethereum-zxc/issues)

> 0xcert protocol token implementation for the Ethereum blockchain.

This is the official implementation of the `ZXC` 0xcert protocol token for the Ethereum blockchain. This is an open source project build with [Truffle](http://truffleframework.com) framework.

## Structure

Since this is a Truffle project, you will find all tokens in `contracts/tokens/` directory.

## Requirements

* NodeJS 9.0+ recommended.
* Windows, Linux or Mac OS X.

## Installation

### NPM

This is an [NPM](https://www.npmjs.com/package/@0xcert/ethereum-zxc) module for [Truffle](http://truffleframework.com) framework. In order to use it as a dependency in your Javascript project, you must install it through the `npm` command:

```
$ npm install @0xcert/ethereum-zxc
```

### Source

Clone the repository and install the required npm dependencies:

```
$ git clone git@github.com:0xcert/ethereum-zxc.git
$ cd ethereum-xcert
$ npm install
```

Make sure that everything has been set up correctly:

```
$ npm run test
```

All tests should pass.

## Usage

### NPM

To interact with package's contracts within JavaScript code, you simply need to require that package's .json files:

```js
const contract = require("@0xcert/ethereum-zxc/build/contracts/ZXCToken.json");
console.log(contract);
```

### Source

```sol
// TODO!!!
```

That's it. Let's compile the contract:

```
$ npm run compile
```

The easiest way to deploy it locally and start interacting with the contract (minting and transferring tokens) is to deploy it on your personal (local) blockchain using [Ganache](http://truffleframework.com/ganache/). Follow the steps in the Truffle documentation which are described [here](http://truffleframework.com/docs/getting_started/project#alternative-migrating-with-ganache).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to help out.

## Licence

See [LICENSE](./LICENSE) for details.
