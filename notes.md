First challenge:

nc 3.89.118.147 20001


Info
---

[1] - Create an account which will be used to deploy the challenge contract
[2] - Deploy the challenge contract using your generated account
[3] - Get your flag once you meet the requirement
[4] - Show the contract source code
[-] input your choice: 1
[+] deployer account: 0x8e20a12473aa9265DF1043b3946c3725674F96Ac
[+] token: v4.local.SsEADxsul-wreMSqtmBPHixRGFNsUbQ87JJOjqCZ5mqL-gRuwZ8uc0dHLYURL97YgKR8sw7kUThVrOAM1UkdgBXDJhu-2ZI4XnXulUoGDUb0ggAlurPQWZl3aZhYRuuPmGz4yIBzODxiJnU8L_R3M4a8lZY2dZ51_s4zPSgGfRWxpQ

Let's be a PNM DAO Hacker. Secure Web3 together!

[1] - Create an account which will be used to deploy the challenge contract
[2] - Deploy the challenge contract using your generated account
[3] - Get your flag once you meet the requirement
[4] - Show the contract source code
[-] input your choice: 2
[-] input your token: v4.local.SsEADxsul-wreMSqtmBPHixRGFNsUbQ87JJOjqCZ5mqL-gRuwZ8uc0dHLYURL97YgKR8sw7kUThVrOAM1UkdgBXDJhu-2ZI4XnXulUoGDUb0ggAlurPQWZl3aZhYRuuPmGz4yIBzODxiJnU8L_R3M4a8lZY2dZ51_s4zPSgGfRWxpQ
[+] contract address: 0xa145293e9F7cb2c549AB96d71333D1bea85aA44A
[+] transaction hash: 0x8e64f3ebbc9e0414b080e2ef86577f9147ce69665f0607b5a129b1cecc93d687


Contract @
0xa145293e9F7cb2c549AB96d71333D1bea85aA44A

Tx Hash
0x8e64f3ebbc9e0414b080e2ef86577f9147ce69665f0607b5a129b1cecc93d687

Network:
Ropsten


Exploitt
---

### Goal:
Get the `emit FLAG(msg.sender)` to emit


At line 57:

```
abi.encodeWithSignature("PwnedNoMore(uint256)", _amount)
```

If my malicious contract has a method called `PwnedNoMor(unint256)`
then it will be called here

I can use this to gain reentrancy

### What to do with reentrancy?

get this conditions to be true:
```
if (balances[msg.sender] == 0xDA0) {
```

balance = 0x3127c1ed0f4dff88ba2312
    = 0xDA0 + 59425114757512643212875124 - 1 -1

Need to get `_amount =  59425114757512643212875122` so that `balance = 0xDA0`

First time `_amount=2` because 
recrods1 = 1, and 
records2 = 1 and 
below condition:
```
if (records1[sender] + (records2[sender]) != _amount) {
    return;
}
```


**Fibonacci 125th = 59425114757512643212875125**
https://www.omnicalculator.com/math/fibonacci 

// Gas to send: 1,663,874 * 10 

Used https://dashboard.tenderly.co/tx/ropsten/0x1d7b508b74bf0dc3cd321e49196bf83979c3f4f8dc06a2ad8c4a37603297393e/gas-usage
to see what error was happening

See the gas usage. the error was `out of gas`

So, modified the gas limit to `1,663,874 * 10`



Notes
---

Used hardhat to test if the exploit is working correctly

Then tried on hardhat node (test chain @ localhost)
    was not working

Retry on Ropsten
    was not working
Used **tenderly** (see above link) to debug the transactions
Also used ropsten internal tx view : https://ropsten.etherscan.io/tx/0x1d7b508b74bf0dc3cd321e49196bf83979c3f4f8dc06a2ad8c4a37603297393e#internal 


Saw that it was failing at a certain depth
    need to make sure the error reason,
    info not given in ropsten
    so used tenderly