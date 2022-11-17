const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMe", async () => {
   let fundMe;
   let deployer;
   let mockV3Aggregator;
   beforeEach(async () => {
      // const accounts = await ethers.getSigners();
      deployer = (await getNamedAccounts()).deployer;
      await deployments.fixture(["all"]);
      fundMe = await ethers.getContract("FundMe", deployer);
      mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
   });

   describe("constructor", async () => {
      it("sets the aggregator addresses correctly", async () => {
         const response = await fundMe.priceFeed();
         assert.equal(response, mockV3Aggregator.address);
      });
   });

   describe("fund", async () => {
      it("fails if u don't send enough ETH", async () => {
         await expect(fundMe.fund()).to.be.revertedWithCustomError(fundMe, 'FundMe_SentNotEnough');
      });
   });
});
