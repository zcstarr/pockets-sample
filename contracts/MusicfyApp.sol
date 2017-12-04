pragma solidity ^0.4.17;
import 'smart-pockets/contracts/PocketsHub.sol';
import 'smart-pockets/contracts/Pockets.sol';
import 'smart-pockets/contracts/Registry.sol';
import 'smart-pockets/contracts/Service.sol';

contract MusicifyApp{

    PocketsHub public pocketsHub;
    address public owner;
    address public pocketAddress;
    address private service;

    event LogNewUser (
      address owner,
      address pocket
    );

    function MusicifyApp()
      public 
    {
        owner = msg.sender;
        // Create a pocket hub 
        pocketsHub = new PocketsHub(17000);
        service = pocketsHub.newService();
        pocketsHub.trustedRegistry().registerPlan(
            service, 
            1 ether, // payment 
            34000, // payment freq in ms 
            0.02 ether,  // initial deposit 
            true, // recurring payment 
            "Basic Plan" // plan
        );
    }


    function newUser(bytes plan)
        public
        returns(address)
    {
        pocketAddress = pocketsHub.newPocket();
        Pockets pocket = Pockets(pocketAddress);
        pocket.deposit(msg.value);
        pocket.registerService(service, plan);
        pocket.transferOwnership(msg.sender);
        LogNewUser(pocket.owner(), pocketAddress);
        return pocketAddress;
    }

}