const assert=require("assert");
const x=require("../safe-preflight.json");
const expected=[
  "0x745B9B869900B2D8c2742DD9361Cba88EB133c15",
  "0xdc2f1175f73e474f673717bc91583865cb3db074",
  "0xaaa6a3c51a7fcca64348951cadda1f671144b64c"
];
assert.equal(x.chain_id,4663);
assert.equal(x.safe_version,"1.4.1");
assert.equal(x.production_safe.threshold,2);
assert.equal(x.production_safe.owners.length,3);
assert.deepEqual(x.production_safe.owners,expected);
assert.equal(new Set(x.production_safe.owners.map(v=>v.toLowerCase())).size,3);
for(const a of x.production_safe.owners) assert.match(a,/^0x[0-9a-fA-F]{40}$/);
assert.equal(x.production_safe.status,"SIGNERS_CONFIGURED_SAFE_CREATION_PENDING");
assert.equal(x.production_safe.address,null);
assert.equal(x.canonical_contracts.proxy_factory,"0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67");
assert.equal(x.canonical_contracts.safe_l2_singleton,"0x29fcB43b46531BcA003ddC8FCB67FFE91900C762");
assert.equal(x.release_gate,"PRODUCTION_MULTISIG_OPEN_UNTIL_SAFE_CREATED_AND_VERIFIED");
console.log("PRODUCTION SAFE SIGNER CONFIG PASS");