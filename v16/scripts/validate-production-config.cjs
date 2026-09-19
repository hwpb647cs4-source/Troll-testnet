const fs = require("fs");
const assert = require("assert");
const ethers = require("ethers");

const file = process.argv[2];
if (!file) throw new Error("usage: node validate-production-config.cjs <config.json>");
const c = JSON.parse(fs.readFileSync(file, "utf8"));

const placeholders = JSON.stringify(c).match(/REPLACE_WITH_[A-Z_]+/g) || [];
const checks = {
  chain4663: c.network?.chain_id === 4663,
  auditCommitPinned: /^[0-9a-f]{40}$/.test(c.audit_target_commit || ""),
  noBroadcastMode: c.mode === "TEMPLATE_ONLY_DO_NOT_BROADCAST",
  rpcFromEnv: c.network?.rpc_env === "RH_RPC_URL",
  explorerPinned: c.network?.explorer === "https://robinhoodchain.blockscout.com",
  templateStillBlocked: placeholders.length > 0,
  allReleaseGatesFalse: Object.values(c.gates || {}).every(v => v === false),
  noProductionAddressesPretended:
    Object.values(c.contracts || {}).every(v => v === null)
};

for (const [name, ok] of Object.entries(checks)) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  assert.ok(ok, name);
}
console.log("V16 TEMPLATE VALIDATION PASS");
console.log("Placeholders remaining:", [...new Set(placeholders)].join(", "));
console.log("This template is intentionally NOT deployable.");
