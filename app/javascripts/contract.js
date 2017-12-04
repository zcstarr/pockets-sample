const Web3 = require('web3');
const truffleContractFactory = require('truffle-contract');


const PocketsJson = require('../../build/contracts/Pockets.json');
const PocketsHubJson = require('../../build/contracts/PocketsHub.json');
const RegistryJson = require('../../build/contracts/Registry.json');
const ServiceJson = require('../../build/contracts/Service.json');
const MusicfyAppJson = require('../../build/contracts/MusicifyApp.json');

const Pockets = truffleContractFactory(PocketsJson);
const Service = truffleContractFactory(ServiceJson);
const PocketsHub = truffleContractFactory(PocketsHubJson);
const Registry = truffleContractFactory(RegistryJson);
const MusicifyApp = truffleContractFactory(MusicfyAppJson);

let web3;
let provider;

if (!web3){
  provider = new Web3.providers.HttpProvider('http://localhost:9545');
  web3 = new Web3(provider);
}

web3.eth.getAccountsPromise = () =>
  new Promise((resolve, reject) =>
    web3.eth.getAccounts((error, accounts) =>
      error ? reject(error) : resolve(accounts)));

[Pockets, Service, PocketsHub, Registry, MusicifyApp]
  .forEach(contract => contract.setProvider(provider));

module.exports = {
  web3,
  Pockets,
  PocketsHub,
  Registry,
  Service,
  MusicifyApp,
};
