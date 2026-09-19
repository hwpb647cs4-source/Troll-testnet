const fs = require("fs");
const path = require("path");

const out = "v17/generated/audit-bundle";
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});

const files = [
  "v15/contracts/TrollProductionCandidateV15.sol",
  "v15/test/v15.security-hardening.test.cjs",
  "v15/package.json",
  "v15/hardhat.config.cjs",
  "v15/scripts-static-check.cjs",
  "v17/AUDIT_TARGET.json",
  "v17/docs/AUDIT_SCOPE.md",
  "v17/docs/CHANGE_CONTROL.md",
  "v17/docs/RELEASE_GATE.md",
  "v17/generated/AUDIT_BUILD_MANIFEST.json"
];

for (const src of files) {
  const dest = path.join(out,src);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.copyFileSync(src,dest);
}
console.log("Audit bundle staged at",out);
