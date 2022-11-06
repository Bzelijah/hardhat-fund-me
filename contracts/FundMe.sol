// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./PriceConverter.sol";

    error FundMe_NowOwner();
    error FundMe_SentNotEnough();
    error FundMe_CallFailed();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    address public immutable i_owner;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        if (msg.value.getConversionRate(priceFeed) <= MINIMUM_USD) { revert FundMe_SentNotEnough(); }
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint256 idx = 0; idx < funders.length; idx++) {
            address funderAddress = funders[idx];
            addressToAmountFunded[funderAddress] = 0;
        }

        funders = new address[](0);

        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        if (!callSuccess) { revert FundMe_CallFailed(); }
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) { revert FundMe_NowOwner(); }
        _;
    }
}
