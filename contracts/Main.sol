// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";

contract L2Storage is ERC721 {
    uint256 public currentTokenId;
    uint256 public constant MAX_SUPPLY = 10000;

    address constant L1_BLOCKS_ADDRESS = 0x5300000000000000000000000000000000000001;
    address constant L1_SLOAD_ADDRESS = 0x0000000000000000000000000000000000000101;
    address immutable boredApeAddress = 0x4cE9573b89B7f52d1dB92DD3b4b4319660ECD895;
    address immutable punkAddress = 0xd3fa06239aC1E89d2BAA11f1A6CC157dC1199eFA;
    uint256 boredApeAmount;
    uint256 punkAmount;

    event VibeChecked(address Viber, uint256 tokenId);
    event VibeNotChecked(address Viber);

    constructor() ERC721("VIBE CHECK", "VIBE") {} // hard coded for testing

    function retrieveL1BoredApe(address account) internal returns(uint) {
        uint slotNumber = 0;
        uint accountBalanceSlot = uint(
            keccak256(abi.encodePacked(uint(uint160(account)),
            slotNumber)
        ));
        bool success;
        bytes memory returnValue;
        (success, returnValue) = L1_SLOAD_ADDRESS.staticcall(abi.encodePacked(boredApeAddress, accountBalanceSlot));
        if(!success) {
            revert("L1SLOAD failed");
        }
        boredApeAmount = abi.decode(returnValue, (uint));
        return boredApeAmount;
    }

    function retrieveL1Punks(address account) internal returns(uint) {
        uint slotNumber = 0;
        uint accountBalanceSlot = uint(
            keccak256(abi.encodePacked(uint(uint160(account)),
            slotNumber)
        ));
        bool success;
        bytes memory returnValue;
        (success, returnValue) = L1_SLOAD_ADDRESS.staticcall(abi.encodePacked(punkAddress, accountBalanceSlot));  // Fixed: changed from boredApeAddress to punkAddress
        if(!success) {
            revert("L1SLOAD failed");
        }
        punkAmount = abi.decode(returnValue, (uint));
        return punkAmount;
    }

    function mint() internal {
        require(currentTokenId < MAX_SUPPLY, "Max supply reached");
        uint256 tokenId = currentTokenId;
        currentTokenId += 1;
        _mint(msg.sender, tokenId);
    }

    function vibeCheck() external {
        retrieveL1BoredApe(msg.sender);
        retrieveL1Punks(msg.sender);
        if ((punkAmount + boredApeAmount) >= 2) {
            mint();
            emit VibeChecked(msg.sender, currentTokenId - 1);
        } else {
            emit VibeNotChecked(msg.sender);
        }
    }

    function tokenURI(uint256) public pure override returns (string memory) {
        return "https://cdn.prod.website-files.com/5a9ee6416e90d20001b20038/63c1cfdfc00b88fb10e4b0fc_horizontal%20(9).svg";
    }
}
