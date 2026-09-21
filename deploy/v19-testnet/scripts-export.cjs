const fs=require("fs"),path=require("path");
const names=["MockAssetV19","TrollInHoodGenesisV19","TrollEvolutionEngineV19","TrollMetadataRouterV19","TrollBoundVaultFactoryV19","TrollAssetRegistryV19","TrollRewardRouterV19","TrollLensV19","TrollAssetSnapshotAnchorV19"];
const out={version:"v19-final-testnet",reviewedCommit:"c3750b9458156e962393059f78c92e79802bf622",solc:"0.8.24",contracts:{}};
for(const name of names){
 const p=path.join("v19","artifacts","contracts","TrollProductionCandidateV19.sol",name+".json");
 const a=JSON.parse(fs.readFileSync(p,"utf8"));
 out.contracts[name]={abi:a.abi,bytecode:a.bytecode,deployedBytecode:a.deployedBytecode};
}
fs.mkdirSync(path.join("deploy","v19-testnet"),{recursive:true});
fs.writeFileSync(path.join("deploy","v19-testnet","compiled.json"),JSON.stringify(out));
console.log("Wrote",Object.keys(out.contracts).length,"V19 deployment artifacts");