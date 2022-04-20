// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./UserItems.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract GreedClaim is UserItems, ReentrancyGuard {
    using Address for address payable;

    mapping(Quality => uint256) public _ratioByQuality;

    mapping(address => bool) public _refunded;

    uint256 public _cashPrize;

    bool public _over;
    bool public _withdrawStarted;

    uint256 public _withdrawLimitDate;
    uint256 public _withdrawLength = 600;
    uint256 public _ratioToPercent = 100000000;

    event nowOver(address indexed account);

    event nowNotOver(address indexed account);

    event withdrawStarted(address indexed account, uint256 indexed limitDate, uint256 indexed cashPrize);

    event withdrawNotStarted(address indexed account);

    event withdrawed(
        address indexed to,
        uint256 indexed balance,
        uint256 indexed amount
    );

    function contractBalance() external view returns(uint256) {
        return address(this).balance;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        require(_over == false, "Game is still over !");
        _unpause();
    }

    function setOver() external onlyOwner {
        _pause();
        _over = true;
        emit nowOver(_msgSender());
    }

    function setNotOver() external onlyOwner {
        require(_withdrawStarted == false, "Withdraw still open !");
        _unpause();
        _over = false;
        emit nowNotOver(_msgSender());
    }

    function setWithdrawStarted() external onlyOwner {
        require(_over == true, "Game is not over !");
        _withdrawStarted = true;
        _withdrawLimitDate = block.timestamp + _withdrawLength;
        _cashPrize = address(this).balance / 2;
        emit withdrawStarted(_msgSender(), _withdrawLimitDate, _cashPrize);
    }

    function setWithdrawNotStarted() external onlyOwner {
        require(_over == true, "Game is not over !");
        _withdrawStarted = false;
        emit withdrawNotStarted(_msgSender());
    }

    function withdraw() external payable nonReentrant {
        require(_over == true, "Game is not over !");
        require(_withdrawStarted == true, "Withdraw not started !");
        require(_refunded[msg.sender] != true, "Already received a refund !");
        uint256 ratio;
        for (uint256 i = 0; i <= 100; i++) {
            if (_userCards[msg.sender][i].length != 0) {
              Quality addToRatio = _qualityByNumber[i];
              ratio += _ratioByQuality[addToRatio]; 
            }
        }
        require(ratio != 0, "No S, SS, X cards found !");
        uint256 balanceBeforeTransfer = address(this).balance;
        uint256 amount = ( _cashPrize * ratio) / _ratioToPercent;
        _refunded[msg.sender] = true;
        payable(msg.sender).sendValue(amount);
        emit withdrawed(msg.sender, balanceBeforeTransfer, amount);
    }

    function cleanContract() external payable onlyOwner nonReentrant {
        require(_over == true, "Game is not over !");
        require(_withdrawStarted == true, "Withdraws not started !");
        require(block.timestamp >= _withdrawLimitDate, "Too soon to clean !");

        uint256 balanceBeforeTransfer = address(this).balance;
        uint256 amount = (address(this).balance);
        payable(msg.sender).sendValue(amount);
        emit withdrawed(msg.sender, balanceBeforeTransfer, amount);
    }
}
