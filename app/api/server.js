const express = require('express');
const cors = require('cors');
const { PocketsHub, Pockets, Registry, Service, web3 } = require('./contracts');
const yargs = require('yargs');
const {argv} =  yargs;
const app = express();
const port = 3000;

let accounts;
let service;
let hub;
let owner;
let registry;

yargs.option('verbose', {
  alias: 'v',
  default: false,
  describe: 'Super verbose mode',
});
 yargs
.usage('Usage: $0 --hub [address] --service [address]')
.demandOption(['hub','service'])
.argv;

const users= {};

// Utility Functions 
const getPocketDeadline = async (pocketAddress) => {
  const pocket = await Pockets.at(pocketAddress)
  // balance, active, subscription, paymentAmount, paymentDeadline
  const [, , , , paymentDeadline] = await pocket.call.getPocket(service.address);
  return paymentDeadline;
};

const collectPayment = async (pocketAddress) => {
   const paymentDeadline = await getPocketDeadline(pocketAddress);
   if( paymentDeadline < web3.eth.blockNumber)
     return { gasUsed: 0};

   let tx = await service.requestHold(pocketAddress, { from: owner });
   return {gasUsed: tx.gasUsed, amountHeld:null};
};

const getPocketBalance = async (pocketAddress) => {
  const pocket = await Pockets.at(pocketAddress);
  return await pocket.getPocketBalance.call(service.address);
};

const createNewToken = () => {
  return Math.randomInt().toString(16).slice(2);
};

app.use(cors());

//Routes 

// Collect payments that are due from pockets
app.post('/collect', async (request, response) => {
  console.log('collecting payments');
  const subscribers = await service.getNumberOfPockets.call();
  for (let i = 0; i < subscribers; i++) {
    const [pocketAddress] = await service.getPocketByIdx.call(0);
    let user = users[pocketAddress]
    try {
      const { gasUsed } = await collectPayment(pocketAddress);
      console.log(`used ${gasUsed}`);
      response.send({ gasUsed })
    } catch (){
      user = { token: createNewToken() }
      console.error('Accesss lost, withdraw from pocket failed ')
    }
  }
  response.statusCode(400);
  response.send();
});

//Grant an access token so users can play music
app.post('/token/:pocketAddress', async (request, response) => {
  const { pocketAddress } = request.params;
  const newToken = { token: createNewToken() }
  try {
    const { gasUsed } = await collectPayment(pocketAddress);
    if(!users[pocketAddress]) 
        users[pocketAddress] = newToken;
    response.send({ token: users[pocketAddress].token });
  } catch (e) {
    console.error(e);
    response.status(400);
    response.send();
  }
  
});

//Verify the access token is still valid for the play route 
app.post('/play', async (request, response) => {
  const { token, address } = request.params;
  if (users[address] && users[address].token === token) {
    response.send({'message': 'Streaming track'});
  }
  response.status(401);
  response.send();
});

// Setup the pockethub address and service hub address
app.listen(port, async (err) => {
    accounts = await web3.eth.getAccountsPromise();
    service = Service.at(argv.service);
    hub = PocketsHub.at(argv.hub);
    owner = await service.owner.call();
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
  console.log('starting service with:');
  console.log(`hub:${hub.address}, ${service.address}:service, ${owner}:owner`);
})