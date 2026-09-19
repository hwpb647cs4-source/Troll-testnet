const fs = require("fs");
const assert = require("assert");

const s = fs.readFileSync("contracts/TrollProductionCandidateV15.sol", "utf8");

const checks = {
  supply5000: s.includes("MAX_SUPPLY = 5000"),
  genesisHash: s.includes("7658b0b924dfa9578a7172798a94ac8f799993ff9f9045fed13022a360adcdbe"),
  familyRoot: s.includes("6f1c3a173b47ed7551c72dacbe1a5b69ef2e08dce33c1d8e78eaa627bf76d1a3"),
  noNftBurnFunction: !/function\s+(burn|sacrifice|extinguish)\s*\(/i.test(s),
  vaultNoExecute: !/contract TrollBoundVaultV15[\s\S]*?function\s+execute\s*\(/i.test(s),
  vaultNoWithdraw: !/contract TrollBoundVaultV15[\s\S]*?function\s+withdraw\s*\(/i.test(s),
  exactAssetIdentity: s.includes("keyFor(uint256 chainId, address token)"),
  regulatedLane: s.includes("REGULATED_ENTITLEMENT"),
  directLane: s.includes("DIRECT_VAULT"),
  reentrancyGuard: s.includes("contract TrollRewardRouterV15 is Ownable2Step, ReentrancyGuard"),
  actualCreditAccounting: s.includes("uint256 credited = IERC20(a.token).balanceOf(vault) - beforeBal"),
  futureSnapshotBlocked: s.includes('require(blockNumber <= block.number, "future block")'),
  explicitInitialOwners:
    s.includes("constructor(address initialOwner, address royaltyReceiver") &&
    s.includes("constructor(address initialOwner) Ownable(initialOwner)") &&
    s.includes("constructor(address initialOwner, address vaultFactory_, address registry_)"),
  evolution175k: s.includes("ASCENDED  = 175_000 ether"),
  evolution1m: s.includes("OMEGA     = 1_000_000 ether")
};

for (const [name, ok] of Object.entries(checks)) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  assert.ok(ok, name);
}
console.log(`STATIC ${Object.keys(checks).length}/${Object.keys(checks).length} PASS`);