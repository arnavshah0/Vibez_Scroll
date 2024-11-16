// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol";

contract BoredApe is ERC721 {
    uint256 public currentTokenId;
    uint256 public constant MAX_SUPPLY = 10000;

    constructor() ERC721("PUNKS", "PUNK") {
        mint();
        mint();
        mint();
    }

    function mint() public {
        require(currentTokenId < MAX_SUPPLY, "Max supply reached");
        uint256 tokenId = currentTokenId;
        currentTokenId += 1;
        _mint(msg.sender, tokenId);
    }
}
