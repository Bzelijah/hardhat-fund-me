// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./PriceConverter.sol";

    error NotOwner();
    error SendedNotEnough();
    error CallFailed();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    address public immutable i_owner;

    constructor() {
        i_owner = msg.sender;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        if (msg.value.getConversionRate() <= MINIMUM_USD) { revert SendedNotEnough(); }
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
        if (!callSuccess) { revert CallFailed(); }
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) { revert NotOwner(); }
        _;
    }
}
