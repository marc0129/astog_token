// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Ownable {
    address private _owner;

    event OwnershipRenounced(address indexed previousOwner);

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        _owner = msg.sender;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    function renounceOwnership() public onlyOwner {
        emit OwnershipRenounced(_owner);
        _owner = address(0);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0));
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;

        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}

/**
 * @title AstogToken
 * @dev ERC20 based on AstogToken Requirements.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract Astog is ERC20, Ownable {
    using SafeMath for uint256;
    address public devFeesWallet;
    uint256 public initialTimestamp;

    mapping(address => bool) public blacklist;
    modifier validDestination( address to ) {
        require(to != address(0x0));
        require(to != address(this) );
        _;
    }

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor() ERC20("AstogEtoken", "ASTG") {

        devFeesWallet = 0x9398C653712585d7854A17D8E5B54Ea9d6999c78;
        initialTimestamp = block.timestamp;
        _mint(msg.sender, 900000000 * 10**decimals());
    }

    /**
     * @dev Override the decimals to change the decimals from default 18 to 9.
     */
    function decimals() public view virtual override returns (uint8) {
        return 9;
    }

    /**
     * @dev Override the _transfer function to accommodate the dev fees.
     */
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override validDestination(recipient){

        require(!blacklist[sender] && !blacklist[recipient], "in_blacklist");

        // calculate dev fees
        uint256 currentRate = _calcDevFees();

        // split the fees from the amount
        uint256 feeAmount = amount.mul(currentRate).div(10000 * 100);
        amount = amount.sub(feeAmount);

        // transfer the fees to dev wallet
        super._transfer(sender, devFeesWallet, feeAmount);
        // transfer remaining tokens to recipient
        super._transfer(sender, recipient, amount);
    }

    function setBotBlacklist(address _botAddress, bool _flag) external onlyOwner {
        require(isContract(_botAddress), "only contract address, not allowed exteranlly owned account");
        blacklist[_botAddress] = _flag;    
    }

    function isContract(address addr) public view returns (bool) {
        uint size;
        assembly { size := extcodesize(addr) }
        return size > 0;
    }

    function currentDevRate() external view returns (uint256) {
        return _calcDevFees();
    }

    function _calcDevFees() internal view returns (uint256) {
        uint256 multiplier = (block.timestamp - initialTimestamp) /
            (10 * 52 weeks);
        uint256 rate = 1000 - (100 * multiplier);
        return rate;
    }
}
