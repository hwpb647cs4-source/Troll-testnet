const fs=require("fs");
const path=require("path");
const crypto=require("crypto");

const TARGET="c3750b9458156e962393059f78c92e79802bf622";
function sha256(b){return crypto.createHash("sha256").update(b).digest("hex")}
function canonical(v){
  if(Array.isArray(v))return "["+v.map(canonical).join(",")+"]";
  if(v&&typeof v==="object")return "{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+canonical(v[k])).join(",")+"}";
  return JSON.stringify(v);
}
function hexBytes(h){return Buffer.from((h||"0x").replace(/^0x/,""),"hex")}

const packageJson=JSON.parse(fs.readFileSync("v19/package.json","utf8"));
const files=[
  "v19/contracts/TrollProductionCandidateV19.sol",
  "v19/test/v19.remediation.test.cjs",
  "v19/package.json",
  "v19/hardhat.config.cjs",
  "v19/scripts-static-check.cjs",
  "v19/scripts/slither-gate.py",
  "v19/docs/SLITHER_REMEDIATION_REGISTER.md"
];

const contracts=[
  "TrollInHoodGenesisV19",
  "TrollBoundVaultV19",
  "TrollBoundVaultFactoryV19",
  "TrollEvolutionEngineV19",
  "TrollMetadataRouterV19",
  "TrollAssetRegistryV19",
  "TrollRewardRouterV19",
  "TrollLensV19",
  "TrollAssetSnapshotAnchorV19",
  "MockAssetV19",
  "FeeOnTransferAssetV19",
  "ReentrantMintReceiverV19"
];

const m={
  schema:"troll.v20.audit-build-manifest.v1",
  audit_target_commit:TARGET,
  generated_at:new Date().toISOString(),
  toolchain:{
    node:process.version,
    solc:require(path.resolve("v19/node_modules/solc")).version(),
    dependencies:packageJson.devDependencies,
    slither:"0.11.6"
  },
  source_files:{},
  contracts:{}
};

for(const p of files){
  const b=fs.readFileSync(p);
  m.source_files[p]={sha256:sha256(b),bytes:b.length};
}

for(const name of contracts){
  const p=path.join("v19","artifacts","contracts","TrollProductionCandidateV19.sol",name+".json");
  const a=JSON.parse(fs.readFileSync(p,"utf8"));
  m.contracts[name]={
    abi_sha256:sha256(Buffer.from(canonical(a.abi))),
    creation_bytecode_sha256:sha256(hexBytes(a.bytecode)),
    runtime_bytecode_sha256:sha256(hexBytes(a.deployedBytecode)),
    creation_bytecode_bytes:hexBytes(a.bytecode).length,
    runtime_bytecode_bytes:hexBytes(a.deployedBytecode).length
  };
}

fs.mkdirSync("v20/generated",{recursive:true});
fs.writeFileSync("v20/generated/AUDIT_BUILD_MANIFEST.json",JSON.stringify(m,null,2));
console.log(JSON.stringify(m,null,2));
