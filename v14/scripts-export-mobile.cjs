const fs = require("fs");
const path = require("path");

const defs = {
  TrollBatchCreate2V14: ["TrollMobileTestnetV14.sol", "TrollBatchCreate2V14"],
  TrollTestnetFundingHelperV14: ["TrollMobileTestnetV14.sol", "TrollTestnetFundingHelperV14"],
  MockAssetV14: ["TrollProductionCandidateV14.sol", "MockAssetV14"],
  TrollInHoodGenesisV14: ["TrollProductionCandidateV14.sol", "TrollInHoodGenesisV14"],
  TrollEvolutionEngineV14: ["TrollProductionCandidateV14.sol", "TrollEvolutionEngineV14"],
  TrollBoundVaultFactoryV14: ["TrollProductionCandidateV14.sol", "TrollBoundVaultFactoryV14"],
  TrollMetadataRouterV14: ["TrollProductionCandidateV14.sol", "TrollMetadataRouterV14"],
  TrollAssetRegistryV14: ["TrollProductionCandidateV14.sol", "TrollAssetRegistryV14"],
  TrollRewardRouterV14: ["TrollProductionCandidateV14.sol", "TrollRewardRouterV14"],
  TrollLensV14: ["TrollProductionCandidateV14.sol", "TrollLensV14"],
  TrollAssetSnapshotAnchorV14: ["TrollProductionCandidateV14.sol", "TrollAssetSnapshotAnchorV14"]
};

const out = {
  version: "14.1-mobile",
  solc: "0.8.24",
  openzeppelin: "5.1.0",
  generatedAt: new Date().toISOString(),
  contracts: {}
};

for (const [name, [file, contract]] of Object.entries(defs)) {
  const p = path.join(
    "artifacts", "contracts", file, contract + ".json"
  );
  const a = JSON.parse(fs.readFileSync(p, "utf8"));
  out.contracts[name] = {
    abi: a.abi,
    bytecode: a.bytecode
  };
}

fs.mkdirSync(path.join("mobile"), { recursive: true });
fs.writeFileSync(
  path.join("mobile", "compiled.json"),
  JSON.stringify(out)
);
console.log("Wrote mobile/compiled.json with", Object.keys(out.contracts).length, "contracts");
