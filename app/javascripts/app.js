// Imporlint the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { web3, Pockets, MusicifyApp } from './contract.js'
import { getEventArgs, startMining } from './util.js';
// This is just a quick example put together to demonstrate how to put all the elements
// together into a system of some sort


const updateBalance = (bal) => {
  document.getElementById('balance').innerText = `Pocket Balance: ${bal}`;
}

const setupUI = (pocketAddress) => {
  const pocket = Pockets.at(pocketAddress);
  const getLatestAvailableBalance = () => {
    return pocket.getAvailableBalance.call().then((bal) => {
      if (bal)
        updateBalance(web3.fromWei(bal, 'ether').toString())
    });
  };

  // Initialize initial balance rendering and watch for balance altering events
  return getLatestAvailableBalance().then(() => {

    const depositEvent = pocket.LogDepositToContract();
    depositEvent.watch((e, r) => {
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
let service;
const appMeta = {};


const start = async () => {
  window.web3.eth.getAccounts(function (err, accs) {
    if (err != null) {
      window.alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      window.alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];
    web3.eth.defaultAccount = accounts[0]


    MusicifyApp.setProvider(window.web3.currentProvider);
    return MusicifyApp.deployed()
      .then((mApp) => {
        // Start mining after the deploy on 17 second interval
        startMining(17);

        musicApp = mApp;
        const pocketSetup = mApp.pocketAddress.call();
        const serviceSetup = mApp.serviceAddress.call();
        const pocketsHubSetup = mApp.pocketsHub.call();
        return Promise.all([pocketSetup, serviceSetup, pocketsHubSetup]).then((addresses)=>{
          appMeta.pocket = addresses[0];
          appMeta.service = addresses[1];
          appMeta.resolved.hub = addresses[2];
        })
      })
      .then(() => console.log('pocket setup complete'))
  });
}

const play = async () => {
  return fetch(`http://localhost:3000/play?token=${appMeta.token}`, { method: "POST" })
    .then((response) => response.json())
    .then(({ message }) => {
      console.log(message)
    });
}

const addToPocketBalance = async () => {
  const pocket = musicApp.pocket;
  if (pocket !== 0)
    return await web3.eth.sendTransaction({ to: pocket, from: account, value: web3.toWei(1, 'ether') })
  console.error('Could not execute transaction without a pocket address');
}

const access = async () => {
  return fetch(`http://localhost:3000/token/${appMeta.pocket}`, {
    method: "POST",
  }).then((response) => {
    return response.json()
      .then(({ token }) => {
        appMeta.token = token;
      })
  });
}

const subscribe = async () => {
  const event = musicApp.LogNewUser();

  let newUser = getEventArgs(event);

  const prom = musicApp.newUser('Basic Plan', 
    {
      value: web3.toWei(1, 'ether'), 
      gas: 4000000, 
      from: window.web3.eth.accounts[0]
    });

  return prom
    .then(() => newUser)
    .then(({ pocket }) => {
      console.log(`your pocket was created at ${pocket}`);
      appMeta.pocket = pocket;
      return Pockets.at(pocket)
        .getPocket
        .call(appMeta.service)
        .then(() => {
          return setupUI(pocket)
            .then(() => {
              return fetch(`http://localhost:3000/token/${pocket}`, { method: "POST" });
            });
        });
    })
    .then((response) => {
      return response.json().then((res) => {
        appMeta.token = res.token;
      });
    }).catch((e) => {
      console.error('Could not fetch the token');
      console.error(e);
    });
};

window.App = {
  start,
  play,
  subscribe,
  service,
  access,
  musicApp,
  appMeta,
  addToPocketBalance
};

window.addEventListener('load', function () {
  window.web3 = web3;
  window.App.start();
});
