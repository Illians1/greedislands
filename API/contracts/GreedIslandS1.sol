// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./GreedClaim.sol";

/// @custom:security-contact security@greedislands.com
contract GreedIslandS1 is ERC721, ERC721URIStorage, ERC721Burnable, GreedClaim {
    using Counters for Counters.Counter;
    using Strings for uint256;

    mapping(uint256 => Counters.Counter) public _countByNumber;

    mapping(address => bool) public _whiteListed;

    mapping(address => mapping(uint256 => bool)) public _authorizedMintingCard;

    mapping(address => mapping(Quality => bool)) public _giftedConsumable;

    bool public _openSales;

    Counters.Counter public _tokenIdCounter;

    string public baseURI;

    address public _marketAddress;

    constructor(
        string memory newBaseURI,
        uint256 _maxBasicCard,
        uint256 _maxACard,
        uint256 _maxSCard,
        uint256 _maxSSCard,
        uint256 _maxXCard,
        uint256 _sRatio,
        uint256 _ssRatio,
        uint256 _xRatio
    ) ERC721("GreedIslandS1", "GI") {
        baseURI = newBaseURI;
        _maxByQuality[Quality.C] = _maxBasicCard;
        _maxByQuality[Quality.B] = _maxBasicCard;
        _maxByQuality[Quality.A] = _maxACard;
        _maxByQuality[Quality.S] = _maxSCard;
        _maxByQuality[Quality.SS] = _maxSSCard;
        _maxByQuality[Quality.X] = _maxXCard;
        _ratioByQuality[Quality.S] = _sRatio;
        _ratioByQuality[Quality.SS] = _ssRatio;
        _ratioByQuality[Quality.X] =  _xRatio;
    }

    function setMarketAddress(address marketAddress) external onlyOwner {
        _marketAddress = marketAddress;
    }

    function authorizeForMinting(address user, uint256 number, bool authorized) external onlyOwner {
        _authorizeForMinting(user, number, authorized);
    }

    function giveConsumable(address user, Quality quality, bool authorized) external onlyOwner {
        _giveConsumable(user, quality, authorized);
    }

    function _authorizeForMinting(address user, uint256 number, bool authorized) internal {
        _authorizedMintingCard[user][number] = authorized;
    }

    function _giveConsumable(address user, Quality quality, bool authorized) internal {
        _giftedConsumable[user][quality] = authorized;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setOpenSales(bool opened) external onlyOwner {
        _openSales = opened;
    }

    function addToWhiteList(address user) external onlyOwner {
        _whiteListed[user] = true;
    }

    function removeFromWhiteList(address user) external onlyOwner {
        _whiteListed[user] = false;
    }

    function mintCards(
        uint256 number
    ) external {
        Quality quality = _qualityByNumber[number];
        TypeOfItem typeOfItem = _typeByQuality[quality];
        address to = msg.sender;

        require(_itemExists[number] == true, "This card doesn't exist !");
        require(_authorizedMintingCard[to][number] == true, "Not authorized for this card !");
        require(typeOfItem == TypeOfItem.CARD, "That is not a card");
        require(
            _countByNumber[number].current() < _maxByQuality[quality],
            "Maximum reached"
        );
        require(
            quality == Quality.C ||
                quality == Quality.B ||
                quality == Quality.A ||
                quality == Quality.S ||
                quality == Quality.SS ||
                quality == Quality.X,
            "Wrong quality for cards"
        );
        uint256 tokenId = _tokenIdCounter.current();
        string memory uri = string(
            abi.encodePacked("cards", "/", number.toString(), ".json")
        );
        _numberByTokenId[tokenId] = number;
        _safeMint(to, tokenId);
        _approve(_marketAddress, tokenId);
        _authorizeForMinting(to, number, false);

        _setTokenURI(tokenId, uri);
        

        _countByNumber[number].increment();
        _tokenIdCounter.increment();
    }

    function mintConsumables(uint256 number)
        external
        payable
    {
        Quality quality = _qualityByNumber[number];
        TypeOfItem typeOfItem = _typeByQuality[quality];
        address to = msg.sender;   
        require(_itemExists[number] == true, "This consumable doesn't exist !");
        require(
            typeOfItem == TypeOfItem.SPELL || typeOfItem == TypeOfItem.TICKET,
            "Only tickets and spells are sellable"
        );

        if (_giftedConsumable[to][quality] == false) {
            require(
                _mintPriceByQuality[quality] == msg.value,
                "Value sent not correct"
            );
            require(_isSellable[quality], "Item not sellable !");
            if (_openSales == false) {
                require(_whiteListed[to] == true, "You are not whitelisted !");
            }
        }

        if (typeOfItem == TypeOfItem.TICKET) {
            require(
                quality == Quality.GOLD ||
                    quality == Quality.PLATINUM ||
                    quality == Quality.DIAMOND,
                "Wrong ticket quality"
            );

        } else {
            require(
                quality == Quality.TP ||
                    quality == Quality.LESSERPOTION ||
                    quality == Quality.GREATERPOTION ||
                    quality == Quality.CARDFINDER ||
                    quality == Quality.SPEEDBONUS,
                "Wrong spell quality"
            );
        }
        uint256 tokenId = _tokenIdCounter.current();
        uint256 uintQuality = uint256(quality);

        string memory uri = string(
            abi.encodePacked("conso", "/", uintQuality.toString(), ".json")
        );
        _numberByTokenId[tokenId] = number;
        _safeMint(to, tokenId);
        _approve(_marketAddress, tokenId);
        _giveConsumable(to, quality, false);

        _setTokenURI(tokenId, uri);
       

        _tokenIdCounter.increment();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
        uint256 number = _numberByTokenId[tokenId];
        Quality quality = _qualityByNumber[number];
        TypeOfItem typeOfItem = _typeByQuality[quality];


         if (typeOfItem == TypeOfItem.CARD) {
            if (from != address(0)) {
                deleteUserCard( from, tokenId, number);
            }
            _userCards[to][number].push(tokenId);
            _tokenItemIndex[tokenId] = _userCards[to][number].length -1;
        } else {
            if (from != address(0)) {
                deleteUserConsumable(from, tokenId, quality);
            }
            _userConsumables[to][quality].push(tokenId);
            _tokenItemIndex[tokenId] = _userConsumables[to][quality].length -1;
        } 
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        super._transfer(from, to, tokenId);
        _approve(_marketAddress, tokenId);
    }

    function deleteUserCard(address user, uint256 tokenId, uint256 number) internal {
        uint256 lastTokenIndex = _userCards[user][number].length - 1;
        uint256 tokenIndex = _tokenItemIndex[tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _userCards[user][number][lastTokenIndex];

            _userCards[user][number][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
            _tokenItemIndex[lastTokenId] = tokenIndex; // Update the moved token's index
        }

        // This also deletes the contents at the last position of the array
        delete _tokenItemIndex[tokenId];
        _userCards[user][number].pop();
    }

    function deleteUserConsumable(address user, uint256 tokenId, Quality quality) internal {
        uint256 lastTokenIndex = _userConsumables[user][quality].length - 1;
        uint256 tokenIndex = _tokenItemIndex[tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _userConsumables[user][quality][lastTokenIndex];

            _userConsumables[user][quality][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
            _tokenItemIndex[lastTokenId] = tokenIndex; // Update the moved token's index
        }

        // This also deletes the contents at the last position of the array
        delete _tokenItemIndex[tokenId];
        _userConsumables[user][quality].pop();
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        uint256 number = _numberByTokenId[tokenId];
        Quality quality = _qualityByNumber[number];
        TypeOfItem typeOfItem = _typeByQuality[quality];
         require(
            typeOfItem != TypeOfItem.CARD,
            "Only tickets or spells are burnable !"
        );
        super._burn(tokenId);
    } 

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

