const { run } = require("hardhat");


async function verify(contractAddress, args) {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args
        });
    } catch (error) {
        if (error.message.toLowerCase().includes("already verifiend")) {
            console.log("Already Verified!");
        } else {
            console.log(error);
        }
    }
}
module.exports = {
    verify,
}