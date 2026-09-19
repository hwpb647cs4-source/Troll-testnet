# Reviewer Reproduction — V19

```bash
git clone https://github.com/hwpb647cs4-source/Troll-testnet.git
cd Troll-testnet
git checkout c3750b9458156e962393059f78c92e79802bf622

cd v19
npm install --no-audit --no-fund
npm run validate:static
npm run compile
npm test
```

Expected:
- static remediation invariants: PASS
- Solidity compile: PASS
- focused native-ETH test: PASS
- malicious receiver reentrancy test: PASS
- full lifecycle/security regression: PASS

For Slither:

```bash
python -m pip install slither-analyzer==0.11.6
slither . --exclude-dependencies --json generated/slither.json
python scripts/slither-gate.py generated/slither.json
```

Expected security gate:

`PASS — no High/Medium Slither detectors`
