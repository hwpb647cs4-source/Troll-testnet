// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/interfaces/IERC4906.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

library TrollV19Config {
    uint256 internal constant MAX_SUPPLY = 5000;
    bytes32 internal constant GENESIS_MANIFEST_SHA256 =
        0x7658b0b924dfa9578a7172798a94ac8f799993ff9f9045fed13022a360adcdbe;
    bytes32 internal constant FAMILY_MERKLE_ROOT =
        0x6f1c3a173b47ed7551c72dacbe1a5b69ef2e08dce33c1d8e78eaa627bf76d1a3;

    uint256 internal constant AWAKENED  = 10_000 ether;
    uint256 internal constant CHARGED   = 30_000 ether;
    uint256 internal constant RELIC     = 75_000 ether;
    uint256 internal constant ASCENDED  = 175_000 ether;
    uint256 internal constant LEGENDARY = 400_000 ether;
    uint256 internal constant OMEGA     = 1_000_000 ether;
}

library Sha256MerkleV19 {
    function hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return uint256(a) <= uint256(b)
            ? sha256(abi.encodePacked(a, b))
            : sha256(abi.encodePacked(b, a));
    }

    function verify(bytes32[] calldata proof, bytes32 root, bytes32 leaf)
        internal
        pure
        returns (bool)
    {
        bytes32 h = leaf;
        for (uint256 i = 0; i < proof.length; ++i) {
            h = hashPair(h, proof[i]);
        }
        return h == root;
    }
}

interface IV19MetadataRouter {
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract TrollInHoodGenesisV19 is ERC721Enumerable, ERC2981, Ownable2Step, IERC4906, ReentrancyGuard {
    enum Family {
        GENESIS_TROLL, SILVER, USDC, GOLD, APPLE, NVIDIA,
        MICROSOFT, AMAZON, ALPHABET, META, TESLA
    }

    uint256 public nextTokenId = 1;
    address public mintController;
    address public evolutionEngine;
    address public metadataRouter;

    bool public mintControllerFrozen;
    bool public evolutionEngineFrozen;
    bool public metadataRouterFrozen;

    mapping(uint256 => Family) private _family;
    mapping(uint256 => bool) public familyRevealed;
    mapping(uint256 => uint64) public mintTimestamp;
    mapping(uint256 => uint64) public holderSince;

    error NotMintController();
    error NotEvolutionEngine();
    error SoldOut();
    error Frozen();
    error InvalidFamilyProof();

    constructor(address initialOwner, address royaltyReceiver, uint96 royaltyBps)
        ERC721("TROLL NFT 2.0 Genesis", "TROLLG")
        Ownable(initialOwner)
    {
        require(initialOwner != address(0), "zero owner");
        require(royaltyReceiver != address(0), "zero royalty receiver");
        require(royaltyBps <= 1_000, "royalty too high");
        _setDefaultRoyalty(royaltyReceiver, royaltyBps);
    }

    function setMintController(address a, bool freeze_) external onlyOwner {
        if (mintControllerFrozen) revert Frozen();
        require(a != address(0), "zero controller");
        mintController = a;
        if (freeze_) mintControllerFrozen = true;
    }

    function setEvolutionEngine(address a, bool freeze_) external onlyOwner {
        if (evolutionEngineFrozen) revert Frozen();
        require(a != address(0), "zero engine");
        evolutionEngine = a;
        if (freeze_) evolutionEngineFrozen = true;
    }

    function setMetadataRouter(address a, bool freeze_) external onlyOwner {
        if (metadataRouterFrozen) revert Frozen();
        require(a != address(0), "zero router");
        metadataRouter = a;
        if (freeze_) metadataRouterFrozen = true;
    }

    /// @notice One-transaction production/testnet wiring helper.
    /// @dev Preserves the same one-way freeze semantics as the individual setters.
    function configureCore(
        address mintController_,
        address evolutionEngine_,
        address metadataRouter_,
        bool freezeAll
    ) external onlyOwner {
        if (mintControllerFrozen || evolutionEngineFrozen || metadataRouterFrozen) revert Frozen();
        require(
            mintController_ != address(0) &&
            evolutionEngine_ != address(0) &&
            metadataRouter_ != address(0),
            "zero core address"
        );

        mintController = mintController_;
        evolutionEngine = evolutionEngine_;
        metadataRouter = metadataRouter_;

        if (freezeAll) {
            mintControllerFrozen = true;
            evolutionEngineFrozen = true;
            metadataRouterFrozen = true;
        }
    }

    function mintFromController(address to, uint256 quantity)
        external
        nonReentrant
        returns (uint256 firstTokenId)
    {
        if (msg.sender != mintController) revert NotMintController();
        require(to != address(0), "zero recipient");
        require(quantity > 0, "zero quantity");
        if (nextTokenId + quantity - 1 > TrollV19Config.MAX_SUPPLY) revert SoldOut();

        firstTokenId = nextTokenId;
        uint64 ts = uint64(block.timestamp);

        // Reserve the complete range before any external ERC721Receiver callback.
        nextTokenId = firstTokenId + quantity;

        for (uint256 i = 0; i < quantity; ++i) {
            uint256 id = firstTokenId + i;
            mintTimestamp[id] = ts;
            holderSince[id] = ts;
        }

        for (uint256 i = 0; i < quantity; ++i) {
            _safeMint(to, firstTokenId + i);
        }
    }

    function revealFamily(uint256 tokenId, Family f, bytes32[] calldata proof) external {
        ownerOf(tokenId);
        require(!familyRevealed[tokenId], "already revealed");

        bytes32 leaf = sha256(abi.encodePacked(tokenId, uint8(f)));
        if (!Sha256MerkleV19.verify(proof, TrollV19Config.FAMILY_MERKLE_ROOT, leaf)) {
            revert InvalidFamilyProof();
        }

        _family[tokenId] = f;
        familyRevealed[tokenId] = true;
        emit MetadataUpdate(tokenId);
    }

    function familyOf(uint256 tokenId) external view returns (uint8) {
        ownerOf(tokenId);
        return uint8(_family[tokenId]);
    }

    function notifyMetadataUpdate(uint256 tokenId) external {
        if (msg.sender != evolutionEngine) revert NotEvolutionEngine();
        ownerOf(tokenId);
        emit MetadataUpdate(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        ownerOf(tokenId);
        require(metadataRouter != address(0), "router not set");
        return IV19MetadataRouter(metadataRouter).tokenURI(tokenId);
    }

    function genesisManifestSHA256() external pure returns (bytes32) {
        return TrollV19Config.GENESIS_MANIFEST_SHA256;
    }

    function familyMerkleRoot() external pure returns (bytes32) {
        return TrollV19Config.FAMILY_MERKLE_ROOT;
    }

    function maxSupply() external pure returns (uint256) {
        return TrollV19Config.MAX_SUPPLY;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address from)
    {
        from = super._update(to, tokenId, auth);
        if (to != address(0) && from != to) {
            holderSince[tokenId] = uint64(block.timestamp);
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC2981, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC4906).interfaceId || super.supportsInterface(interfaceId);
    }
}

contract TrollBoundVaultV19 is IERC721Receiver, IERC1155Receiver {
    address public immutable nftCollection;
    uint256 public immutable tokenId;
    address public immutable factory;

    constructor(address nft_, uint256 tokenId_, address factory_) {
        require(nft_ != address(0) && factory_ != address(0), "zero");
        nftCollection = nft_;
        tokenId = tokenId_;
        factory = factory_;
    }

    function onERC721Received(address, address, uint256, bytes calldata)
        external
        pure
        returns (bytes4)
    {
        return IERC721Receiver.onERC721Received.selector;
    }

    function onERC1155Received(address, address, uint256, uint256, bytes calldata)
        external
        pure
        returns (bytes4)
    {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata)
        external
        pure
        returns (bytes4)
    {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 id) external pure returns (bool) {
        return id == type(IERC1155Receiver).interfaceId || id == type(IERC165).interfaceId;
    }
}

contract TrollBoundVaultFactoryV19 {
    address public immutable nftCollection;
    mapping(uint256 => address) public vaultOf;

    event VaultCreated(uint256 indexed tokenId, address indexed vault);

    constructor(address nft_) {
        require(nft_ != address(0), "zero nft");
        nftCollection = nft_;
    }

    function createVault(uint256 tokenId) external returns (address vault) {
        require(vaultOf[tokenId] == address(0), "exists");
        bytes32 salt = keccak256(abi.encode(nftCollection, tokenId));
        vault = address(new TrollBoundVaultV19{salt: salt}(nftCollection, tokenId, address(this)));
        vaultOf[tokenId] = vault;
        emit VaultCreated(tokenId, vault);
    }

    function predictVault(uint256 tokenId) external view returns (address predicted) {
        bytes32 salt = keccak256(abi.encode(nftCollection, tokenId));
        bytes memory code = abi.encodePacked(
            type(TrollBoundVaultV19).creationCode,
            abi.encode(nftCollection, tokenId, address(this))
        );
        bytes32 h = keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(code)));
        predicted = address(uint160(uint256(h)));
    }
}

interface IV19NFTForEvolution {
    function ownerOf(uint256 tokenId) external view returns (address);
    function notifyMetadataUpdate(uint256 tokenId) external;
}

contract TrollEvolutionEngineV19 is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum State { GENESIS, AWAKENED, CHARGED, RELIC, ASCENDED, LEGENDARY, OMEGA }

    IERC20 public immutable troll;
    IV19NFTForEvolution public immutable nft;
    address public immutable deadAddress;

    mapping(uint256 => uint256) public burnedByTokenId;
    uint256 public totalProjectBurn;

    event TrollBurned(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 requestedAmount,
        uint256 creditedAmount,
        uint256 cumulativeAmount,
        State state
    );

    constructor(address troll_, address nft_, address deadAddress_) {
        require(troll_ != address(0) && nft_ != address(0) && deadAddress_ != address(0), "zero");
        troll = IERC20(troll_);
        nft = IV19NFTForEvolution(nft_);
        deadAddress = deadAddress_;
    }

    function evolve(uint256 tokenId, uint256 amount) external nonReentrant {
        require(nft.ownerOf(tokenId) == msg.sender, "not owner");
        require(amount > 0, "zero amount");

        uint256 beforeBal = troll.balanceOf(deadAddress);
        troll.safeTransferFrom(msg.sender, deadAddress, amount);
        uint256 credited = troll.balanceOf(deadAddress) - beforeBal;
        require(credited > 0, "zero credit");

        burnedByTokenId[tokenId] += credited;
        totalProjectBurn += credited;
        nft.notifyMetadataUpdate(tokenId);

        emit TrollBurned(
            tokenId,
            msg.sender,
            amount,
            credited,
            burnedByTokenId[tokenId],
            stateOf(tokenId)
        );
    }

    function stateOf(uint256 tokenId) public view returns (State) {
        uint256 b = burnedByTokenId[tokenId];
        if (b >= TrollV19Config.OMEGA) return State.OMEGA;
        if (b >= TrollV19Config.LEGENDARY) return State.LEGENDARY;
        if (b >= TrollV19Config.ASCENDED) return State.ASCENDED;
        if (b >= TrollV19Config.RELIC) return State.RELIC;
        if (b >= TrollV19Config.CHARGED) return State.CHARGED;
        if (b >= TrollV19Config.AWAKENED) return State.AWAKENED;
        return State.GENESIS;
    }

    function rewardWeightBps(uint256 tokenId) external view returns (uint256) {
        State s = stateOf(tokenId);
        if (s == State.GENESIS) return 10_000;
        if (s == State.AWAKENED) return 11_000;
        if (s == State.CHARGED) return 12_500;
        if (s == State.RELIC) return 15_000;
        if (s == State.ASCENDED) return 20_000;
        if (s == State.LEGENDARY) return 30_000;
        return 50_000;
    }
}

interface IV19StateReader {
    function stateOf(uint256 tokenId) external view returns (TrollEvolutionEngineV19.State);
}

contract TrollMetadataRouterV19 {
    using Strings for uint256;
    string public baseURI;
    IV19StateReader public immutable evolution;

    constructor(string memory baseURI_, address evolution_) {
        require(bytes(baseURI_).length > 0 && evolution_ != address(0), "bad config");
        baseURI = baseURI_;
        evolution = IV19StateReader(evolution_);
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        return string.concat(
            baseURI,
            tokenId.toString(),
            "/",
            uint256(evolution.stateOf(tokenId)).toString(),
            ".json"
        );
    }
}

contract TrollAssetRegistryV19 is Ownable2Step {
    enum AssetClass { TROLL, STABLE, GOLD, SILVER, STOCK, OTHER }
    enum Lane { DIRECT_VAULT, REGULATED_ENTITLEMENT }

    struct AssetConfig {
        uint256 chainId;
        address token;
        uint8 decimals;
        AssetClass assetClass;
        Lane lane;
        bool enabled;
        string symbol;
    }

    mapping(bytes32 => AssetConfig) private _asset;

    event AssetRegistered(
        bytes32 indexed assetKey,
        uint256 indexed chainId,
        address indexed token,
        AssetClass assetClass,
        Lane lane,
        bool enabled,
        string symbol
    );

    constructor(address initialOwner) Ownable(initialOwner) {
        require(initialOwner != address(0), "zero owner");
    }

    function keyFor(uint256 chainId, address token) public pure returns (bytes32) {
        return keccak256(abi.encode(chainId, token));
    }

    struct AssetInput {
        uint256 chainId;
        address token;
        uint8 decimals;
        AssetClass assetClass;
        Lane lane;
        bool enabled;
        string symbol;
    }

    function registerAsset(
        uint256 chainId,
        address token,
        uint8 decimals,
        AssetClass assetClass,
        Lane lane,
        bool enabled,
        string calldata symbol
    ) external onlyOwner returns (bytes32 assetKey) {
        assetKey = _registerAsset(chainId, token, decimals, assetClass, lane, enabled, symbol);
    }

    function registerAssets(AssetInput[] calldata items)
        external
        onlyOwner
        returns (bytes32[] memory keys)
    {
        keys = new bytes32[](items.length);
        for (uint256 i = 0; i < items.length; ++i) {
            AssetInput calldata a = items[i];
            keys[i] = _registerAsset(
                a.chainId,
                a.token,
                a.decimals,
                a.assetClass,
                a.lane,
                a.enabled,
                a.symbol
            );
        }
    }

    function _registerAsset(
        uint256 chainId,
        address token,
        uint8 decimals,
        AssetClass assetClass,
        Lane lane,
        bool enabled,
        string memory symbol
    ) internal returns (bytes32 assetKey) {
        require(chainId != 0, "zero chain");
        require(token != address(0), "zero token");
        require(bytes(symbol).length > 0, "empty symbol");

        assetKey = keyFor(chainId, token);
        _asset[assetKey] = AssetConfig({
            chainId: chainId,
            token: token,
            decimals: decimals,
            assetClass: assetClass,
            lane: lane,
            enabled: enabled,
            symbol: symbol
        });

        emit AssetRegistered(assetKey, chainId, token, assetClass, lane, enabled, symbol);
    }

    function asset(bytes32 assetKey) external view returns (AssetConfig memory) {
        return _asset[assetKey];
    }
}

interface IV19VaultFactory {
    function vaultOf(uint256 tokenId) external view returns (address);
}

interface IV19AssetRegistry {
    function asset(bytes32 assetKey)
        external
        view
        returns (TrollAssetRegistryV19.AssetConfig memory);
}

contract TrollRewardRouterV19 is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IV19VaultFactory public immutable vaultFactory;
    IV19AssetRegistry public immutable registry;

    mapping(uint256 => mapping(bytes32 => uint256)) public entitlementAmount;
    mapping(uint256 => mapping(bytes32 => bytes32)) public entitlementManifestHash;

    event DirectRewardDeposited(
        uint256 indexed tokenId,
        bytes32 indexed assetKey,
        address indexed vault,
        address token,
        uint256 requestedAmount,
        uint256 creditedAmount
    );

    event RegulatedEntitlementRecorded(
        uint256 indexed tokenId,
        bytes32 indexed assetKey,
        uint256 amount,
        uint256 cumulativeAmount,
        bytes32 manifestHash
    );

    constructor(address initialOwner, address vaultFactory_, address registry_) Ownable(initialOwner) {
        require(initialOwner != address(0), "zero owner");
        require(vaultFactory_ != address(0) && registry_ != address(0), "zero");
        vaultFactory = IV19VaultFactory(vaultFactory_);
        registry = IV19AssetRegistry(registry_);
    }

    function depositDirect(uint256 tokenId, bytes32 assetKey, uint256 amount)
        external
        nonReentrant
    {
        require(amount > 0, "zero amount");
        TrollAssetRegistryV19.AssetConfig memory a = registry.asset(assetKey);
        require(a.enabled, "asset disabled");
        require(a.chainId == block.chainid, "wrong chain");
        require(a.lane == TrollAssetRegistryV19.Lane.DIRECT_VAULT, "regulated lane");

        address vault = vaultFactory.vaultOf(tokenId);
        require(vault != address(0), "vault missing");

        uint256 beforeBal = IERC20(a.token).balanceOf(vault);
        IERC20(a.token).safeTransferFrom(msg.sender, vault, amount);
        uint256 credited = IERC20(a.token).balanceOf(vault) - beforeBal;
        require(credited > 0, "zero credit");

        emit DirectRewardDeposited(
            tokenId,
            assetKey,
            vault,
            a.token,
            amount,
            credited
        );
    }

    function recordRegulatedEntitlement(
        uint256 tokenId,
        bytes32 assetKey,
        uint256 amount,
        bytes32 manifestHash
    ) external onlyOwner {
        require(amount > 0, "zero amount");
        require(manifestHash != bytes32(0), "zero manifest");

        TrollAssetRegistryV19.AssetConfig memory a = registry.asset(assetKey);
        require(a.enabled, "asset disabled");
        require(a.lane == TrollAssetRegistryV19.Lane.REGULATED_ENTITLEMENT, "direct lane");

        entitlementAmount[tokenId][assetKey] += amount;
        entitlementManifestHash[tokenId][assetKey] = manifestHash;

        emit RegulatedEntitlementRecorded(
            tokenId,
            assetKey,
            amount,
            entitlementAmount[tokenId][assetKey],
            manifestHash
        );
    }
}

interface IV19GenesisForLens {
    function ownerOf(uint256 tokenId) external view returns (address);
    function familyOf(uint256 tokenId) external view returns (uint8);
    function familyRevealed(uint256 tokenId) external view returns (bool);
    function mintTimestamp(uint256 tokenId) external view returns (uint64);
    function holderSince(uint256 tokenId) external view returns (uint64);
    function totalSupply() external view returns (uint256);
}

interface IV19EvolutionForLens {
    function burnedByTokenId(uint256 tokenId) external view returns (uint256);
    function stateOf(uint256 tokenId) external view returns (TrollEvolutionEngineV19.State);
    function rewardWeightBps(uint256 tokenId) external view returns (uint256);
    function totalProjectBurn() external view returns (uint256);
}

contract TrollLensV19 {
    struct Passport {
        address owner;
        bool familyRevealed;
        uint8 family;
        uint64 mintTimestamp;
        uint64 holderSince;
        uint256 trollBurned;
        uint8 evolutionState;
        uint256 rewardWeightBps;
        address boundVault;
    }

    IV19GenesisForLens public immutable nft;
    IV19EvolutionForLens public immutable evolution;
    IV19VaultFactory public immutable vaultFactory;

    constructor(address nft_, address evolution_, address vaultFactory_) {
        require(nft_ != address(0) && evolution_ != address(0) && vaultFactory_ != address(0), "zero");
        nft = IV19GenesisForLens(nft_);
        evolution = IV19EvolutionForLens(evolution_);
        vaultFactory = IV19VaultFactory(vaultFactory_);
    }

    function passport(uint256 tokenId) external view returns (Passport memory p) {
        p.owner = nft.ownerOf(tokenId);
        p.familyRevealed = nft.familyRevealed(tokenId);
        p.family = nft.familyOf(tokenId);
        p.mintTimestamp = nft.mintTimestamp(tokenId);
        p.holderSince = nft.holderSince(tokenId);
        p.trollBurned = evolution.burnedByTokenId(tokenId);
        p.evolutionState = uint8(evolution.stateOf(tokenId));
        p.rewardWeightBps = evolution.rewardWeightBps(tokenId);
        p.boundVault = vaultFactory.vaultOf(tokenId);
    }

    function collectionStats()
        external
        view
        returns (uint256 minted, uint256 totalTrollBurned)
    {
        minted = nft.totalSupply();
        totalTrollBurned = evolution.totalProjectBurn();
    }
}

contract TrollAssetSnapshotAnchorV19 is Ownable2Step {
    struct Snapshot {
        bytes32 manifestHash;
        uint64 blockNumber;
        uint64 timestamp;
    }

    mapping(uint256 => Snapshot) public latest;

    event AssetSnapshotPublished(
        uint256 indexed tokenId,
        bytes32 indexed manifestHash,
        uint64 blockNumber
    );

    constructor(address initialOwner) Ownable(initialOwner) {
        require(initialOwner != address(0), "zero owner");
    }

    function publish(uint256 tokenId, bytes32 manifestHash, uint64 blockNumber)
        external
        onlyOwner
    {
        require(manifestHash != bytes32(0), "zero hash");
        require(blockNumber > 0, "zero block");
        require(blockNumber <= block.number, "future block");

        latest[tokenId] = Snapshot(manifestHash, blockNumber, uint64(block.timestamp));
        emit AssetSnapshotPublished(tokenId, manifestHash, blockNumber);
    }
}

contract MockAssetV19 is ERC20 {
    uint8 private immutable _customDecimals;

    constructor(string memory name_, string memory symbol_, uint8 decimals_)
        ERC20(name_, symbol_)
    {
        _customDecimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}


/// @notice Test-only adversarial ERC-20 with a configurable transfer fee.
/// @dev Used by V19 security tests to verify actual-credit accounting.
contract FeeOnTransferAssetV19 is ERC20 {
    uint256 public immutable feeBps;
    address public immutable feeSink;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 feeBps_,
        address feeSink_
    ) ERC20(name_, symbol_) {
        require(feeBps_ <= 2_000, "fee too high");
        require(feeSink_ != address(0), "zero sink");
        feeBps = feeBps_;
        feeSink = feeSink_;
    }

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (
            from != address(0) &&
            to != address(0) &&
            feeBps != 0
        ) {
            uint256 fee = (value * feeBps) / 10_000;
            uint256 net = value - fee;
            super._update(from, feeSink, fee);
            super._update(from, to, net);
        } else {
            super._update(from, to, value);
        }
    }
}


/// @notice Test-only receiver that attempts to reenter mintFromController during safe mint.
contract ReentrantMintReceiverV19 is IERC721Receiver {
    TrollInHoodGenesisV19 public immutable nft;
    bool public attempted;
    bool public reentrySucceeded;

    constructor(address nft_) {
        nft = TrollInHoodGenesisV19(nft_);
    }

    function attackMint() external {
        nft.mintFromController(address(this), 1);
    }

    function onERC721Received(address, address, uint256, bytes calldata)
        external
        returns (bytes4)
    {
        attempted = true;
        try nft.mintFromController(address(this), 1) {
            reentrySucceeded = true;
        } catch {
            reentrySucceeded = false;
        }
        return IERC721Receiver.onERC721Received.selector;
    }
}
