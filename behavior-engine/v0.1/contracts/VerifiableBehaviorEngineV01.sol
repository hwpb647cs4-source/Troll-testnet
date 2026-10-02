// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title VerifiableBehaviorEngineV01
/// @notice Experimental, non-custodial behavior/state engine. No production deployment.
/// @dev PRECOMMIT -> ACT -> RESOLVE -> LOCK -> PROVENANCE. Entropy is an optional
///      committed input for branch selection; burn amount remains the sole evolution-strength input.
contract VerifiableBehaviorEngineV01 {
    enum Phase { NONE, PRECOMMITTED, ACTED, RESOLVED, LOCKED }

    struct Journey {
        Phase phase;
        bytes32 ruleHash;
        bytes32 commitment;
        bytes32 actionHash;
        bytes32 provenanceHash;
        uint96 cumulativeBurn;
        uint32 nonce;
        uint16 evolutionBps;
        uint8 branch;
    }

    mapping(uint256 => Journey) private journeys;
    mapping(bytes32 => bool) public consumedEvidence;

    error BadPhase();
    error BadReveal();
    error Replay();
    error ZeroRule();
    error ZeroEvidence();
    error BurnRegression();

    event Precommitted(uint256 indexed tokenId, uint32 indexed nonce, bytes32 ruleHash, bytes32 commitment);
    event Acted(uint256 indexed tokenId, uint32 indexed nonce, bytes32 evidenceHash, uint96 cumulativeBurn);
    event Resolved(uint256 indexed tokenId, uint32 indexed nonce, uint8 branch, uint16 evolutionBps, bytes32 provenanceHash);
    event Locked(uint256 indexed tokenId, uint32 indexed nonce, bytes32 provenanceHash);

    function journey(uint256 tokenId) external view returns (Journey memory) {
        return journeys[tokenId];
    }

    function precommit(uint256 tokenId, bytes32 ruleHash, bytes32 commitment) external {
        Journey storage j = journeys[tokenId];
        if (j.phase != Phase.NONE && j.phase != Phase.LOCKED) revert BadPhase();
        if (ruleHash == bytes32(0)) revert ZeroRule();

        uint32 nextNonce = j.nonce + 1;
        j.phase = Phase.PRECOMMITTED;
        j.ruleHash = ruleHash;
        j.commitment = commitment;
        j.actionHash = bytes32(0);
        j.provenanceHash = bytes32(0);
        j.nonce = nextNonce;
        j.branch = 0;
        emit Precommitted(tokenId, nextNonce, ruleHash, commitment);
    }

    /// @notice Records externally verified evidence. Adapter/integration layer must verify a real burn.
    function recordAction(uint256 tokenId, bytes32 evidenceHash, uint96 newCumulativeBurn) external {
        Journey storage j = journeys[tokenId];
        if (j.phase != Phase.PRECOMMITTED) revert BadPhase();
        if (evidenceHash == bytes32(0)) revert ZeroEvidence();
        if (consumedEvidence[evidenceHash]) revert Replay();
        if (newCumulativeBurn < j.cumulativeBurn) revert BurnRegression();

        consumedEvidence[evidenceHash] = true;
        j.cumulativeBurn = newCumulativeBurn;
        j.actionHash = evidenceHash;
        j.phase = Phase.ACTED;
        emit Acted(tokenId, j.nonce, evidenceHash, newCumulativeBurn);
    }

    /// @dev Commitment binds token, nonce, rule version and salt. Entropy affects branch only,
    ///      never evolution strength. This prevents random rarity from overriding Troll burn rules.
    function resolve(uint256 tokenId, bytes32 salt, bytes32 entropy) external {
        Journey storage j = journeys[tokenId];
        if (j.phase != Phase.ACTED) revert BadPhase();

        bytes32 expected = keccak256(abi.encode(tokenId, j.nonce, j.ruleHash, salt));
        if (expected != j.commitment) revert BadReveal();

        j.evolutionBps = _burnStrength(j.cumulativeBurn);
        j.branch = uint8(uint256(keccak256(abi.encode(j.ruleHash, j.actionHash, salt, entropy))) % 8);
        j.provenanceHash = keccak256(
            abi.encode(tokenId, j.nonce, j.ruleHash, j.actionHash, j.cumulativeBurn, j.evolutionBps, j.branch)
        );
        j.phase = Phase.RESOLVED;
        emit Resolved(tokenId, j.nonce, j.branch, j.evolutionBps, j.provenanceHash);
    }

    function lock(uint256 tokenId) external {
        Journey storage j = journeys[tokenId];
        if (j.phase != Phase.RESOLVED) revert BadPhase();
        j.phase = Phase.LOCKED;
        emit Locked(tokenId, j.nonce, j.provenanceHash);
    }

    /// @notice Monotonic strength derived only from cumulative TROLL burn.
    /// @dev Experimental scale: 0..10000 bps; thresholds are manifest/version controlled.
    function _burnStrength(uint96 burn) internal pure returns (uint16) {
        if (burn >= 1_000_000 ether) return 10_000;
        if (burn >= 500_000 ether) return 8_000;
        if (burn >= 175_000 ether) return 6_000;
        if (burn >= 50_000 ether) return 4_000;
        if (burn > 0) return 2_000;
        return 0;
    }
}
