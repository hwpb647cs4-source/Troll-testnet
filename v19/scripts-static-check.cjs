const fs=require("fs");
const assert=require("assert");
const s=fs.readFileSync("contracts/TrollProductionCandidateV19.sol","utf8");

const checks={
  supply5000:s.includes("MAX_SUPPLY = 5000"),
  noNftBurn:!/function\s+(burn|sacrifice|extinguish)\s*\(/i.test(s),
  passiveVaultNoReceive:!s.match(/contract TrollBoundVaultV19[\s\S]*?receive\s*\(/),
  passiveVaultNoExecute:!s.match(/contract TrollBoundVaultV19[\s\S]*?function\s+execute\s*\(/),
  passiveVaultNoWithdraw:!s.match(/contract TrollBoundVaultV19[\s\S]*?function\s+withdraw\s*\(/),
  mintNonReentrant:s.includes("external\n        nonReentrant\n        returns (uint256 firstTokenId)"),
  mintRangeReservedBeforeSafeMint:
    s.indexOf("nextTokenId = firstTokenId + quantity") <
    s.indexOf("_safeMint(to, firstTokenId + i)"),
  timestampsBeforeSafeMint:
    s.indexOf("mintTimestamp[id] = ts") <
    s.indexOf("_safeMint(to, firstTokenId + i)"),
  exactAssetIdentity:s.includes("keyFor(uint256 chainId, address token)"),
  actualCreditAccounting:s.includes("uint256 credited = IERC20(a.token).balanceOf(vault) - beforeBal"),
  futureSnapshotBlocked:s.includes('require(blockNumber <= block.number, "future block")')
};

for(const [name,ok] of Object.entries(checks)){
  console.log((ok?"PASS":"FAIL")+" "+name);
  assert.ok(ok,name);
}
console.log("STATIC "+Object.keys(checks).length+"/"+Object.keys(checks).length+" PASS");
