// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ItemsConfig is Ownable, Pausable {
    mapping(Quality => uint256) public _maxByQuality;

    mapping(Quality => uint256) public _mintPriceByQuality;

    mapping(Quality => bool) public _isSellable;

    mapping(uint256 => Quality) public _qualityByNumber;

    mapping(Quality => TypeOfItem) public _typeByQuality;

    mapping(uint256 => uint256) public _numberByTokenId;

    mapping(uint256 => bool) public _itemExists;

    enum TypeOfItem {
        TICKET,
        SPELL,
        CARD
    }

    enum Quality {
        GOLD,
        PLATINUM,
        DIAMOND,
        C,
        B,
        A,
        S,
        SS,
        X,
        TP,
        LESSERPOTION,
        GREATERPOTION,
        CARDFINDER,
        SPEEDBONUS
    }
 
    function _setSellable(Quality quality, bool sellable) public onlyOwner {
        _isSellable[quality] = sellable;
    }

    function setQualityByNumber(Quality[] memory qualityOfNumber) external onlyOwner {
        for (uint256 i = 0; i < qualityOfNumber.length; i++) {
            _qualityByNumber[i] = qualityOfNumber[i];
            _itemExists[i] = true;
        }
    }

    function setTypeByQuality(TypeOfItem typeOfItem, Quality quality) external onlyOwner {
        _typeByQuality[quality] = typeOfItem;
    }

    function setPriceByQuality(uint256 price, Quality quality) external onlyOwner {
        _mintPriceByQuality[quality] = price;
    }

}
