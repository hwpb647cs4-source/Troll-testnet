const fs = require("fs");
const assert = require("assert");
const p = "contracts/TrollProductionCandidateV14.sol";
const s = fs.readFileSync(p, "utf8");

const checks = {
  supply5000: s.includes("MAX_SUPPLY = 5000"),
  genesisHash: s.includes("7658b0b924dfa9578a7172798a94ac8f799993ff9f9045fed13022a360adcdbe"),
  familyRoot: s.includes("6f1c3a173b47ed7551c72dacbe1a5b69ef2e08dce33c1d8e78eaa627bf76d1a3"),
  noNftBurnFunction: !/function\s+(burn|sacrifice|extinguish)\s*\(/i.test(s),
  passiveVaultNoExecute: !/contract TrollBoundVaultV14[\s\S]*?function\s+execute\s*\(/i.test(s),
  passiveVaultNoWithdraw: !/contract TrollBoundVaultV14[\s\S]*?function\s+withdraw\s*\(/i.test(s),
  directAndRegulatedLanes: s.includes("DIRECT_VAULT") && s.includes("REGULATED_ENTITLEMENT"),
  stockClass: s.includes("STOCK"),
  silverClass: s.includes("SILVER"),
  goldClass: s.includes("GOLD"),
  exactContractRegistry: s.includes("keyFor(uint256 chainId, address token)"),
  evolution175k: s.includes("ASCENDED  = 175_000 ether"),
  evolution1m: s.includes("OMEGA     = 1_000_000 ether")
};

for (const [name, ok] of Object.entries(checks)) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  assert.ok(ok, name);
}
console.log(`STATIC ${Object.keys(checks).length}/${Object.keys(checks).length} PASS`);