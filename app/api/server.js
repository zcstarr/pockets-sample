const express = require('express');
const cors = require('cors');
const { PocketsHub, Pockets, Registry, Service, web3 } = require('../javascripts/contract');
const yargs = require('yargs');
const {argv} =  yargs;
const app = express();
const port = 3000;

let accounts;
let service;
let hub;
let owner;
let registry;

const args = yargs.option('verbose', {
  alias: 'v',
  default: false,
  describe: 'Super verbose mode',
})
.option('hub', {
  string: true,
  demand: true,
})
.option('service', {
  string: true,
  demand: true,
})
.usage('Usage: $0 --hub [address] --service [address]')
.argv

const users= {};
const tokenLookup = {};

// Utility Functions 
const getPocketDeadline = async (pocketAddress) => {
  const pocket = Pockets.at(pocketAddress)
  // balance, active, subscription, paymentAmount, paymentDeadline
  let  [a,b ,c ,d , paymentDeadline] = await pocket.getPocket.call(service.address);
  console.log([a, b, c, d, paymentDeadline]);
  return paymentDeadline;
};

const checkDeadlineExpired = async (pocketAddress) => {
  const paymentDeadline = await getPocketDeadline(pocketAddress);
  return (paymentDeadline.toString() <= web3.eth.blockNumber.toString())
}

const collectPayment = async (pocketAddress) => {
  console.log(`yep ${pocketAddress}`)
  const tx = await service.requestHold(pocketAddress, { from: web3.eth.accounts[0] });
  console.log(`yessir ${pocketAddress}`)
  console.log(tx.logs[0].args);
   return { gasUsed: tx.gasUsed, amountHeld: null };
};

const getPocketBalance = async (pocketAddress) => {
  const pocket = await Pockets.at(pocketAddress);
  return await pocket.getPocketBalance.call(service.address);
};

const createNewToken = () => {
  return Math.random().toString(16).slice(2)
};

app.use(cors());
app.set('query parser', true);
app.set('url parser', true);

//Routes 

// Collect payments that are due from pockets
app.post('/collect', async (request, response) => {
  console.log('collecting payments');
  const subscribers = await service.getNumberOfPockets.call();
  let paymentCount = 0;
  for (let i = 0; i < subscribers; i++) {
    const [pocketAddress] = await service.getPocketByIdx.call(i);
    try {
      const expired = await checkDeadlineExpired(pocketAddress);
      console.log(expired)
      console.log(pocketAddress)
      if (!expired){
        console.log('Was not expired safe')
        return
      }

      console.log(`collecting payment from ${pocketAddress}`)
      const { gasUsed } = await collectPayment(pocketAddress);
      console.log(`used ${gasUsed}`);
      paymentCount++;
    } catch (e) {
      users[pocketAddress] = createNewToken();
      console.log('Accesss lost, withdraw from pocket failed')
      console.log(e);
    }
  }
  response.status(200);
  response.send(`Collected payments from ${paymentCount} subscribers\r\n`);
});

//Grant an access token so users can play music
app.post('/token/:pocketAddress', async (request, response) => {

const {pocketAddress} = request.params;
console.log(pocketAddress)
  const expired = await checkDeadlineExpired(pocketAddress);
  console.log(`noriega: ${expired}`)
  console.log(expired);
  const newToken = createNewToken();
  if (!expired) {
    if (!users[pocketAddress])
      users[pocketAddress] = newToken;
    tokenLookup[users[pocketAddress]] = pocketAddress;
    response.json({ token: users[pocketAddress] });
    return;
  }
  try {
    const { success } = await collectPayment(pocketAddress);
    users[pocketAddress] = users[pocketAddress] ? users[pocketAddress] : newToken;
    tokenLookup[users[pocketAddress]] = pocketAddress;
    response.json({token: users[pocketAddress]});
  } catch (e) {
    console.error(e);
    response.status(400);
    response.send();
  }
});

//Verify the access token is still valid for the play route 
app.post('/play', async (request, response) => {

  const { token } = request.query;
  const address = tokenLookup[token]

  if (users[address] && users[address] === token) {
    const randomId = Math.random().toString(16).slice(2);
    response.json({message: `Streaming track id:${randomId}`});
  }
  response.status(401);
  response.send();
});

// Setup the pockethub address and service hub address
app.listen(port, async (err) => {
  console.log('starting to listen');
    accounts = await web3.eth.getAccountsPromise();
    debugger
    console.log(args.service);
    service = Service.at(args.service);
    hub = PocketsHub.at(args.hub);
    owner = await service.owner.call();
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
  console.log('starting service with:');
  console.log(`hub:${hub.address}, service:${service.address}, owner:${owner}`);
});

