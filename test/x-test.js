const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Exploit", function () {
  it("Should be success", async function () {
    const Exploit = await ethers.getContractFactory("Exploit");
    const exploit = await Exploit.deploy();
    await exploit.deployed();

    // const registerTx = await exploit.register();
    // await registerTx.wait();

    const launchTx = await exploit.launch();
    const launchReceipt = await launchTx.wait();

    console.log(await exploit.getBal(), launchReceipt);

  });
});
