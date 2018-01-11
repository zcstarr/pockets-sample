const MusicifyApp = artifacts.require("./MusicifyApp.sol");
const PocketsHub = artifacts.require("./PocketsHub.sol");
const Service = artifacts.require("./Service.sol");
const Registry = artifacts.require("./Registry.sol");
const Test = artifacts.require("./Test.sol");

const getServiceEvent = (event) => {
  return new Promise((resolve, error) => {
    event.watch((err, result) => {
      if (err)
        error(err);
      event.stopWatching();
      resolve(result.args);
    })
  });
};

module.exports = function (deployer) {
  return deployer.deploy(PocketsHub, 17000).then(() => {

    const pocketsHub = PocketsHub.at(PocketsHub.address);
    let serviceEvent = getServiceEvent(pocketsHub.LogNewService());
    let service;
    pocketsHub.newService();
    return serviceEvent
      .then((args) => {
        service = args.service;
        return pocketsHub.trustedRegistry.call()
      })
      .then((registryAddress) => {
        return Registry.at(registryAddress).registerPlan(
          service,
          web3.toWei(0.1, 'ether'), // payment 
          68000, // payment freq in ms 
          web3.toWei(0.02, 'ether'),  // initial deposit 
          true, // recurring payment 
          "Basic Plan" // plan
        );
      })
      .then(() => {
        return deployer.deploy(MusicifyApp, PocketsHub.address, service);
      })
      .then(() => {
        return pocketsHub.transferOwnership(MusicifyApp.address);
      })
      .then(() => {
        console.log(`node app/api/server.js --hub ${PocketsHub.address} --service ${service}`)
//        return Service.at(service).transferOwnership(MusicifyApp.address)
      }).then(()=>{

        return deployer.deploy(Test);
      });

  }).catch((e) => {
    console.log(e);
  })
};
