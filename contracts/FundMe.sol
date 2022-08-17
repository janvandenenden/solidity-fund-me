//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//get funds from user
// withdraw funds from contract, owner only
// set a minimum funding value in USD

//962864
//940405 gas saved with applying constant
//913386 gas saved with applying immutable

import "./PriceConverter.sol";

error FundMe__NotOwner();

// /** @title A contract for crowdfunding
//  * @author Jan
//  * @notice This contract is a sample funding contract
//  * @dev Adds pricefeed as our pricefeed
//  * @return what it returns, i.e. for a function
//  * @param specify what parameters should be functions
//  */

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 50 * 1e18;


//state variable for optimizing gas

    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;

    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner{
        // require(msg.sender == i_owner, "sender is not owner");
        if(msg.sender != i_owner) {revert FundMe__NotOwner();}
        _;
    }

    constructor(address priceFeedAddress){
        //msg.sender is whoever deploys the contract
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    } 

    fallback() external payable {
        fund();
    } 

    function fund() public payable {
        require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "didn't send enough");
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public payable onlyOwner {
        for(uint256 funderIndex = 0;funderIndex < s_funders.length ;funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        //resetting an array with with 0 objects
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value:address(this).balance}("");
        require(callSuccess, "Call Failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        //mappings can't be in memory
        for(uint256 funderIndex = 0;funderIndex < funders.length ;funderIndex++){
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
           s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value:address(this).balance}("");
        require(callSuccess, "Call Failed");
    }
 function getOwner() public view returns(address){
    return i_owner;
 }   
 function getFunder(uint256 index)public view returns(address){
     return s_funders[index];
 }
 function getAddressToAmountFunded(address funder) public view returns(uint256){
    return s_addressToAmountFunded[funder];
 }
 function getPriceFeed() public view returns(AggregatorV3Interface){
     return s_priceFeed;
 }
}
