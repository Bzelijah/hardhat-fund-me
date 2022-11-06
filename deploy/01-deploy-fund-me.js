const { network } = require("hardhat");
const { networkConfig, developmentChains } = require('../helper-hardhat-config');

module.exports.default = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    const fundMe = await deploy("FundMe", {
       from: deployer,
       args: [ethUsdPriceFeedAddress],
       log: true,
    });
    log("_________________________________________________");
};

module.exports.tags = ["all", "fundme"];
