// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

// Test-only assets; excluded from production contract selection.
contract CustodyTestNFT is ERC721 {
    constructor() ERC721("Test only", "TEST") {}
    function mint(address to, uint256 id) external { _safeMint(to, id); }
}
contract CustodyTest1155 is ERC1155 {
    constructor() ERC1155("") {}
    function mint(address to, uint256 id, uint256 amount) external { _mint(to, id, amount, ""); }
}
