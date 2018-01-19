# Pockets


This is a sample project that uses the Pockets library to handle recurring payments for a mock Spotify clone. It includes an api server, a web3 frontend , and a smart contract application called MusicifyApp.

## Getting Started
Install truffle
```sh
git clone git@github.com/zcstarr/pockets-sample
yarn install
truffle develop
truffle migrate  --reset
```

After running migration in the truffle console:

In another term
```sh
yarn build
yarn webpack-dev
```

In yet another term

Read the output from the migration and copy the following command from the output:  

```sh
node ./api/server --hub hubAddress --service serviceAddress
```
Next we start a script to collect payment from expiring pockets every 30 seconds
```sh
source api/collect.sh
```

Launch web browser
```sh
  http://locahost:8080
```

## What's it do? 
The sample app creates a dApp that uses Pockets to allow users to subscribe to a mock music service. The music service consists of a web3 frontend that allows users to create a pocket to fund access to the music service.

There is a backend api server that connects via RPC to local node(testRPC). It serves as an interface for a script that polls to collect payements from pockets. The api server also returns an accessToken to a user if the terms of the subscription are still satisified. As long as the user has a pocket balance, the user will be able to continue playing music.

## Metamask Tricks and potential Gotchas


https://github.com/MetaMask/metamask-extension/issues/1999

https://github.com/MetaMask/metamask-extension/issues/2393

More potential metamask issues are potentially resolved by closing and reopening all windows after switching network you could have a metamask caching problem.

## License
Code released under the [MIT License](https://github.com/Pockets/smart-pockets/blob/master/LICENSE).
