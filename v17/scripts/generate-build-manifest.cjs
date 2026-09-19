const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();
const TARGET = "5b5b9ce5bfa1d97ee2500234411648f49c11a71f";

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}
function fileHash(p) {
  return sha256(fs.readFileSync(p));
}
function canonical(v) {
  if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
  if (v && typeof v === "object") {
    return "{" + Object.keys(v).sort().map(k => JSON.stringify(k)+":"+canonical(v[k])).join(",") + "}";
  }
  return JSON.stringify(v);
}
function hexBytes(hex) {
  if (!hex || hex === "0x") return Buffer.alloc(0);
  return Buffer.from(hex.replace(/^0x/,""), "hex");
}

const auditedFiles = [
  "v15/contracts/TrollProductionCandidateV15.sol",
  "v15/test/v15.security-hardening.test.cjs",
  "v15/package.json",
  "v15/hardhat.config.cjs",
  "v15/scripts-static-check.cjs"
];

const contracts = [
  "TrollInHoodGenesisV15",
  "TrollBoundVaultV15",
  "TrollBoundVaultFactoryV15",
  "TrollEvolutionEngineV15",
  "TrollMetadataRouterV15",
  "TrollAssetRegistryV15",
  "TrollRewardRouterV15",
  "TrollLensV15",
  "TrollAssetSnapshotAnchorV15",
  "MockAssetV15",
  "FeeOnTransferAssetV15"
];

const packageJson = JSON.parse(fs.readFileSync("v15/package.json","utf8"));
const manifest = {
  schema: "troll.audit-build-manifest.v1",
  audit_target_commit: TARGET,
  generated_at: new Date().toISOString(),
  toolchain: {
    node: process.version,
    solc: require(path.resolve("v15/node_modules/solc")).version(),
    dependencies: packageJson.devDependencies
  },
  source_files: {},
  contracts: {}
};

for (const p of auditedFiles) {
  manifest.source_files[p] = {
    sha256: fileHash(p),
    bytes: fs.statSync(p).size
  };
}

for (const name of contracts) {
  const p = path.join(
    "v15","artifacts","contracts","TrollProductionCandidateV15.sol",
    name + ".json"
  );
  const a = JSON.parse(fs.readFileSync(p,"utf8"));
  manifest.contracts[name] = {
    abi_sha256: sha256(Buffer.from(canonical(a.abi))),
    creation_bytecode_sha256: sha256(hexBytes(a.bytecode)),
    runtime_bytecode_sha256: sha256(hexBytes(a.deployedBytecode)),
    creation_bytecode_bytes: hexBytes(a.bytecode).length,
    runtime_bytecode_bytes: hexBytes(a.deployedBytecode).length
  };
}

fs.mkdirSync("v17/generated", {recursive:true});
fs.writeFileSync(
  "v17/generated/AUDIT_BUILD_MANIFEST.json",
  JSON.stringify(manifest,null,2)
);
console.log(JSON.stringify(manifest,null,2));
