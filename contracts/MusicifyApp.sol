pragma solidity ^0.4.17;

import 'smart-pockets/contracts/PocketsHub.sol';
import 'smart-pockets/contracts/Pockets.sol';
import 'smart-pockets/contracts/Registry.sol';
import 'smart-pockets/contracts/Service.sol';

contract MusicifyApp{

    PocketsHub public pocketsHub;
    address public owner;
    address public pocketAddress;
    address public serviceAddress;
    address public hubAddress;
    address public registry;

    event LogNewUser (
      address owner,
      address pocket
    );

    event LogDepositToApp(address sender, uint256 amount);

    function MusicifyApp(address hubAddress, address svcAddress)
      public 
    {
        owner = msg.sender;
        pocketsHub = PocketsHub(hubAddress);
        serviceAddress = svcAddress;
    }

    function () payable {
        LogDepositToApp(msg.sender, msg.value);
    } 

    function newUser(bytes plan)
        payable
        public
        returns(address)
    {
        Pockets pocket = pocketsHub.newPocket();
        pocketAddress = pocket;
        pocketAddress.send(msg.value);
        pocket.registerService(serviceAddress, plan);
        LogNewUser(serviceAddress, pocket);
        return pocketAddress;
    }

}