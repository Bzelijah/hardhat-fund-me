const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMe", async () => {
   let fundMe;
   let deployer;
   let mockV3Aggregator;
   const sendValue = ethers.utils.parseEther("1");
   beforeEach(async () => {
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

      it("updated the amount funded data structure ", async () => {
         await fundMe.fund({ value: sendValue });
         const response = await fundMe.addressToAmountFunded(deployer);
         assert.equal(response.toString(), sendValue.toString());
      });

      it('adds funder add to array funders', async () => {
         await fundMe.fund({ value: sendValue });
         const funder = await fundMe.funders(0);
         assert.equal(funder, deployer);
      });
   });

   describe("withdraw", async () => {
      beforeEach(async () => {
         await fundMe.fund({ value: sendValue });
      });

      it ('withraw ETH from a single founder', async () => {
         const starterFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
         const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

         const transactionResponse = await fundMe.withdraw();
         const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
         const gasCost = gasUsed.mul(effectiveGasPrice)

         const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
         const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

         assert.equal(endingFundMeBalance, 0);
         assert.equal(starterFundMeBalance.add(startingDeployerBalance), endingDeployerBalance.add(gasCost).toString());

      });
   });
});
