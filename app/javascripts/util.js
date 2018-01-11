const Web3 = require('web3');
let web3;
let provider;
if (!web3){
  console.log('creating a web3')
  provider = new Web3.providers.HttpProvider('http://localhost:9545');
  web3 = new Web3(provider);
}

const startMining = (secs) => {
  console.log('starting to mine')
 return window.setInterval(() => { 
    advanceBlock().then(()=>{
      console.log('mined block');
    })
  }, secs * 1000)
};

const stopMining = (miningInterval) =>{
  miningInterval.stopInterval();
}

const advanceBlock = () => {
  return new Promise((resolve, error) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine",
      id: 12345
    }, (err, result) => {
      if (err) {
        return error(err);
      }
      resolve(result)
    });

  });
};

module.exports = {
  web3,
  startMining,
  stopMining,
  advanceBlock,
}