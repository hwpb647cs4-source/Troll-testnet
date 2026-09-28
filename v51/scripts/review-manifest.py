"""Hash the exact candidate sources and compiled artifacts; never certify an audit."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
paths = sorted(set(root.glob('contracts/*.sol')) | set(root.glob('rewards/*.mjs')) |
               set(root.glob('artifacts/contracts/**/*.json')) |
               {root / 'package-lock.json', root / 'hardhat.config.cjs'})
hashes = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
if not list(root.glob('artifacts/contracts/**/*.json')):
    raise SystemExit('Compile before generating the review manifest')
output = root / 'generated/build-manifest.json'
output.parent.mkdir(exist_ok=True)
output.write_text(json.dumps({'status': 'CANDIDATE_NOT_AUDITED', 'sha256': hashes}, indent=2) + '\n')
print(output)
