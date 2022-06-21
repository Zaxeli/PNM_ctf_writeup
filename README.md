# PNDMDAORegistry challenge from PNM ctf

This is the writeup for the PNMDAORegistry challenge which was part of the PNM ctf. Link: {}

## The challenge setup

The challenge could be accessed by connecting to `nc 3.89.118.147 20001`. This would give a menu like this:
```
[1] - Create an account which will be used to deploy the challenge contract
[2] - Deploy the challenge contract using your generated account
[3] - Get your flag once you meet the requirement
[4] - Show the contract source code
[-] input your choice:
```

1. The first option will create an account on Ropsten which will deploy the vulnerable contract which needs to be exploited. It will also generate a token which will be used later for identification purposes, so you should save that.
2. Second option will deploy the contract using the contract generated in the first option. Before the contract can be deployed, you will have to transfer some testnet ETH to the account.
3. Once you've exploited the contract, you can use option 3 to get the flag.
4. This shows the source code for the contract.


The source code for the vulnerable contract can be viewed in `contracts/PNMDAORegistry.sol`.

## Exploiting the contract

### Flag requirements
To identify the requirements for getting the flag using the 3rd option in the menu, it will ask for the tx hash where the FLAG() event was emitted. So, we know that the requirement is to somehow get this event to be emitted.


### Reverse engg the target contract
Now, if we look at the functions, we see that the function `identifyPNMDAOHacker()` emits this event. So, we need to be able to call this function. There is a problem, however. The problem is that the balance needs to be exactly equal to `0xDA0` for the function to emit the event.
```
function identifyPNMDAOHacker() public {
    if (balances[msg.sender] == 0xDA0) {
        PNMDAOHackers[msg.sender] = 1;
        emit FLAG(msg.sender);
    }
}
```

This now leads us to investigte how the balances are set and updated. Looking through the code, we see that the balance for a user is set to an initial value when we call the `register()` function. It sets the initial balance as show below:
```
balances[msg.sender] =
    0xDA0 +
    59425114757512643212875124 -
    records1[msg.sender] -
    records2[msg.sender];
```
This balance is also updated later on in the `pwn(uint256 _amount` function. Here, we see that the `_amount` value must be equal to the sum of `records1[sender] + records2[sender]`, otherwise the function will return. But if the `_amount` value is correct, it will decrease the balance by this `_amount` and also update the values stored in `records1[sender]` and `records2[sender]`. 

The pattern here is that of the fibonacci sequence. Specifically, `_amount == records1 + records2` and the new `_amount` value is pushed into `records2` and `records1` takes the old value of `records2`. We can further validate this by looking at the Fibonacci sequence itself---the 125th term is {}

So, if we send the right input to this function, it will decrease the balance, but that still doesn't reduce it to the value that we want, and the function also does not allow us to call it repeatedly because it sets a flag which prevents us from doing that. This is answered with the following line:
```
(bool result, ) = sender.call(
    abi.encodeWithSignature("PwnedNoMore(uint256)", _amount)
);
```
This basically calls a function named `PwnedNoMore(uint256)` in the caller address. Here is the vulnerability that we can exploit.

### Exploiting it
If we define such a function in the caller contract (malicious contract which we design to interact with this target contract) which calls the `pwn()` function again, then we can have reentrancy attack. The flag which prevents normally calling the function again does not interfere here because the state is updated after this 'recursive' calling of `pwn()`.

> Note: The malicious contract can be found in `contracts/x.sol`

If we keep calling the `pwn()` function like this with consecutive Fibonacci values, the we can evetually reduce the balance to the desired target of `0xDA0` (same as `3488` in decimal).

The snippet to do this is shown below:
```
function PwnedNoMore(uint256 _amount) public returns (bool) {
    uint256 new_amt = last_amt + _amount;
    last_amt = _amount;

    if (new_amt <= AMT_LIMIT) {
        // emit AMT(new_amt);
        // console.log("sending pwn(%s)", new_amt);
        registry.pwn(new_amt);
    }
    return true;
}
```
The `AMT_LIMIT` can be set to a value where you want the repeated calling to stop. I used this value to test out different values to stop at; testing smaller values before the very large value required for the flag.

Once the balance is reduced to our satisfaction, we can then get the `FLAG()` event to emit by calling the `identifyPNMDAOHacker()` function **through our malicious contract**. It is important to call it through our malicious contract because it checks the `msg.sender` value.

Once the event is emitted, we simply use the 3rd option in the menu to get the flag.

### Gas concerns
In testing out the exploit, it would work when running it in a VM (using hardhat). But when sending the transaction on the Ropsten testnet it would not work, and it also didn't give any useful error messages. 

In order to debug this problem, I had to be able to inspect the internal tx for it to see why it was failing. I did the tx on Ropsten and then saved the tx hash. Then, going to Etherscan for Ropsten, I looked at the internal tx which is available by clicking on the 'i' symbol; or going to a link of this type: https://ropsten.etherscan.io/tx/{tx_hash}#internal  (Replace the tx hash)


This gave me an indication that it might be gas limit issues. So, I tried to debug the tx using Tenderly. https://dashboard.tenderly.co/tx/ropsten/{tx_hash}/gas-usage (Replace the tx hash)

Using this tool, I could identify that the issue was an 'Out of Gas' problem. So, I increased the gas limit to `1,663,874 * 10`. When I tried the exploit with this gas limit, it would work and I could get the flag.

## Redoing the exploit:
The CTF is over and the challenge is probably taken down now. So, in order to recreate this exploit, do this:

1. Clone this repo
2. Install node modules, hardhat, etc.
3. Instead of using the address of the contract deployed by the challenge, do one of the following:
   1. Get the exploit contract to deploy it by itself and do the exploit on that.
      1. Uncomment out the lines:
      ```
      registry = new PNMDAORegistry();
      ```
      and comment out the line:
      ```
      registry = PNMDAORegistry(target);
      ```
   2. Deploy the target contract yourself and then replace the target address in the exploit contract at this line:
   ```
   address target = 0xa145293e9F7cb2c549AB96d71333D1bea85aA44A;
   ```



