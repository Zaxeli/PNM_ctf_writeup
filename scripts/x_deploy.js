// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Exploit = await hre.ethers.getContractFactory("Exploit");
  const exploit = await Exploit.deploy();

  await exploit.deployed();

  console.log("Exploit deployed to:", exploit.address);

  // We now call the launch function
  const launchTx = await exploit.launch({gasLimit: 1948880});

  const launchReceipt = await launchTx.wait();

  console.log("Launch function done", launchReceipt);

  const getBalTx = await exploit.getBal();
  // const getBalReceipt = await getBalTx.wait();

  console.log(getBalTx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
