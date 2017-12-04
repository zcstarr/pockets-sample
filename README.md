# Pockets


This is a sample project that uses the Pockets library to handle recurring payments for a mock Spotify clone. It includes an api server, a web3 frontend , and a smart contract application called MusicifyApp.



## Getting Started
Install truffle
```sh
git clone git@github.com/zcstarr/pockets-sample
yarn install
truffle develop
truffle migrate --reset
```

After running migration in the truffle console:
```js
let app;
let service;
let hub;
MusicifyApp.deployed().then((i)=>app = i)
hub = app.pocketsHub.call().address;
service = app.service.call().address;
```

In another term
```sh
yarn build
yarn webpack-dev
```

In yet another term
```sh
node ./server --hub hubAddress --service serviceAddress
source shellScript that curls api endpoint;
```

Launch web browser
```sh
  http://locahost:8080
```

## What's it do? 

The sample app creates a dapp that uses the PocketHub, and allows
users to subscribe to the music service. The music service consists of a 
web3 fronted, that allows users to access their pocket and deposit money into the service. The backend api connects via web3 and grants an accessToken 
to the user based on if the most recent valid attempt at pulling funds succeeds. The shell script, will periodically poll the api to allow users that
are fully funded to never suffer an interruption in service.

## License
Code released under the [MIT License](https://github.com/Pockets/smart-pockets/blob/master/LICENSE).