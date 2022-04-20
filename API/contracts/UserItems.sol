// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./ItemsConfig.sol";

contract UserItems is ItemsConfig {
    using Counters for Counters.Counter;

    mapping(address => mapping(uint256 => uint256[])) public _userCards;

    mapping(address => mapping(Quality => uint256[])) public _userConsumables;

    mapping(uint256 => uint256) public _tokenItemIndex;
    
    function getUserCards(address user, uint256 number) external view returns(uint256[] memory) {
        return _userCards[user][number];
    }

    function getUserConsumables(address user, Quality quality) external view returns(uint256[] memory) {
        return _userConsumables[user][quality];
    }


}
