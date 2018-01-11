// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
//import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import {web3, Pockets, PocketsHub, Service, MusicifyApp, Test} from './contract.js'
import {startMining, stopMining } from './util.js';

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
const getEventArgs = (event) => {
  return new Promise((resolve, error) => {
    console.log('watching');
    debugger
    event.watch((err, result) => {
//      console.log(`it has happened ${JSON.stringify(result)}`);
//      console.log(err);
      if (err) {
        console.warn(`Error ${err}`)
        error();
      }
      console.log('printing results')
      console.log(result);
 //     event.stopWatching();
      resolve(result.args);
    })
  });
};

const updateBalance = (bal) => {
  document.getElementById('balance').innerText = `Pocket Balance: ${bal}`;
}

const setupUI = (pocketAddress) => {
  const pocket = Pockets.at(pocketAddress);
  const getLatestAvailableBalance = () => {
    return pocket.getAvailableBalance.call().then((bal) => {
    console.log('got balance');
      if (bal)
        updateBalance(web3.fromWei(bal, 'ether').toString())
    });
  };

  // Initialize initial balance rendering
  return getLatestAvailableBalance().then(() => {

    const depositEvent = pocket.LogDepositToContract();
    depositEvent.watch((e,r)=>{
     getLatestAvailableBalance();
    });
    const event = pocket.LogRequestFunds();
    event.watch((e, r) => {
     getLatestAvailableBalance();
    });
  })

};


let accounts;
let account;
let musicApp;
let musicService;
let pocket;
let service;
let pocketAddress;
let pocketsHub;


const start = async () => {
  window.web3.eth.getAccounts(function (err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];
    web3.eth.defaultAccount = accounts[0]


    MusicifyApp.setProvider(window.web3.currentProvider);
    return MusicifyApp.deployed()
      .then((i) => {
        startMining(17);
        musicApp = i;
        window.musicApp = i;
        console.log('app ')
        console.log(i)
        window.ma = musicApp;
        const pocketSetup = musicApp.pocketAddress.call().then((addr) => {
          if(addr.toString() !== '0x'){
            pocket = Pockets.at(addr);
          }
          console.log('pocket');
          console.log(addr);
        });

        const serviceSetup = musicApp.serviceAddress.call().then((addr) => {
          console.log('service')
          console.log(addr)
          service = Service.at(addr);
        });

        const pocketsHubSetup = musicApp.pocketsHub.call().then((addr) => {

          console.log('hub')
          console.log('addr')
          pocketsHub = PocketsHub.at(addr);
        });

        return Promise.all([pocketSetup, serviceSetup, pocketsHubSetup])
      })
      .then(() => console.log('setup completed'))
      .then(()=>{
        return Test.deployed().then((i)=>{
          console.log(`tthe deployed test app`);
          window.TestApp = i;
        }).catch(console.log);
      })
  });
}
const play = async () =>{
  return fetch(`http://localhost:3000/play?token=${musicApp.token}`, {
    method: "POST",
  }).then((response)=>response.json())
  .then(({message}) =>{
    console.log(message)
  })
}

const access = async () => {
  return fetch(`http://localhost:3000/token/${musicApp.pocket}`, {
    method: "POST",
  }).then((response) => {
    return response.json()
      .then(({ token }) => {
        musicApp.token = token;
      })
  });
}

const subscribe = async () => {
const event = musicApp.LogNewUser();
console.log('subb')
console.log(musicApp.address)
//const event = window.web3.eth.filter({address: musicApp.address.toLowerCase(), topics: ['0x2d24a6051e4605cca3cbbc872fd5d29a3dee667c98b3fcedd3ddee0913ba722a'.toLowerCase()],fromBlock: 0, toBlock: 'latest'})

  let eventPromise = getEventArgs(event);

  let prom = Promise.resolve();
  if (!pocketAddress) {
    console.log(musicApp);
    prom = musicApp.newUser('Basic Plan', { value: web3.toWei(1,'ether'), gas:4000000, from: window.web3.eth.accounts[0]})
      .then((tx) => {
        console.log(tx);
        console.log('signed up')
      });
  }
  return prom
    .then(() => eventPromise)
    .then(({ pocket }) => {
      console.log(`the pocket was created at ${pocket}`);
      //make token request http request
      musicApp.pocket = pocket;
      return Pockets.at(pocket)
        .getPocket.call(service.address)
        .then((s) => console.log(JSON.stringify(s)))
        .then(() => {
          return setupUI(pocket).then(() => {
            return fetch(`http://localhost:3000/token/${pocket}`, {
              method: "POST",
            });
          });
        })

    })
    .then((response) => {
      debugger
       return response.json().then((res)=>{
         musicApp.token = res.token;
       });
    })
    .catch((e) => {
      console.error('Could not fetch the token')
      console.error(e);
    });;
};

window.App = {
  start,
  play,
  subscribe,
  pocketAddress,
  service,
  access,
  musicApp,
  getAvailableBalance: async (pocketAddress) => {
    await Pockets.at(pocketAddress).getAvailableBalance();
  },

  addToPocketBalance: async () => {
    const pocket = window.musicApp.pocket;
    if(pocket !== 0)
      return await web3.eth.sendTransaction({ to: pocket, from: account, value: web3.toWei(1, 'ether') })
    console.error('Could not execute transaction without a pocket address');
  },
/*
  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.sendCoin(receiver, amount, {from: account});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
  */
};

window.addEventListener('load', function() {
  console.log('wttt')
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    console.log('assigning existing web3')
    window.web3 = web3;
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

      App.start();
});
