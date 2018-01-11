const truffleContractFactory = require('truffle-contract');
const { web3 } = require('./util');


const PocketsJson = require('../../build/contracts/Pockets.json');
const PocketsHubJson = require('../../build/contracts/PocketsHub.json');
const RegistryJson = require('../../build/contracts/Registry.json');
const ServiceJson = require('../../build/contracts/Service.json');
const MusicfyAppJson = require('../../build/contracts/MusicifyApp.json');
const TestJson = require('../../build/contracts/Test.json');

const Pockets = truffleContractFactory(PocketsJson);
const Service = truffleContractFactory(ServiceJson);
const PocketsHub = truffleContractFactory(PocketsHubJson);
const Registry = truffleContractFactory(RegistryJson);
const MusicifyApp = truffleContractFactory(MusicfyAppJson);
const Test  = truffleContractFactory(TestJson);

let provider = web3.currentProvider;

web3.eth.getAccountsPromise = () =>
  new Promise((resolve, reject) =>
    web3.eth.getAccounts((error, accounts) =>
      error ? reject(error) : resolve(accounts)));

[Pockets, Service, PocketsHub, Registry, MusicifyApp, Test]
  .forEach(contract => contract.setProvider(provider));

module.exports = {
  web3,
  Pockets,
  PocketsHub,
  Registry,
  Service,
  MusicifyApp,
  Test,
};
