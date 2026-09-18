// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @notice Generic owner-controlled CREATE2 batch deployer for the V14 testnet run.
contract TrollBatchCreate2V14 {
    address public immutable owner;

    event ContractDeployed(
        uint256 indexed index,
        bytes32 indexed salt,
        address indexed deployed
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deployMany(bytes[] calldata initCodes, bytes32[] calldata salts)
        external
        onlyOwner
        returns (address[] memory deployed)
    {
        require(initCodes.length == salts.length, "LENGTH");
        deployed = new address[](initCodes.length);

        for (uint256 i = 0; i < initCodes.length; ++i) {
            bytes memory code = initCodes[i];
            bytes32 salt = salts[i];
            address a;
            assembly {
                a := create2(0, add(code, 0x20), mload(code), salt)
            }
            require(a != address(0), "CREATE2_FAIL");
            deployed[i] = a;
            emit ContractDeployed(i, salt, a);
        }
    }

    function compute(bytes32 salt, bytes32 initCodeHash)
        external
        view
        returns (address)
    {
        bytes32 h = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, initCodeHash)
        );
        return address(uint160(uint256(h)));
    }
}

interface IFaucetAssetV14 {
    function faucet(address to, uint256 amount) external;
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IRewardRouterV14 {
    function depositDirect(uint256 tokenId, bytes32 assetKey, uint256 amount) external;
}

/// @notice Testnet-only helper that reduces wallet prompts for mock direct-asset funding.
/// @dev It never receives production assets and is not part of the production deployment set.
contract TrollTestnetFundingHelperV14 {
    function fundDirectBatch(
        address router,
        uint256 tokenId,
        address[] calldata tokens,
        bytes32[] calldata assetKeys,
        uint256[] calldata amounts
    ) external {
        require(
            tokens.length == assetKeys.length &&
            tokens.length == amounts.length,
            "LENGTH"
        );

        for (uint256 i = 0; i < tokens.length; ++i) {
            IFaucetAssetV14(tokens[i]).faucet(address(this), amounts[i]);
            require(
                IFaucetAssetV14(tokens[i]).approve(router, amounts[i]),
                "APPROVE"
            );
            IRewardRouterV14(router).depositDirect(
                tokenId,
                assetKeys[i],
                amounts[i]
            );
        }
    }
}
