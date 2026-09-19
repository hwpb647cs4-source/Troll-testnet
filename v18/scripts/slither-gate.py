import json, sys
from collections import Counter

path = sys.argv[1] if len(sys.argv) > 1 else "v18/generated/slither.json"
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

if not data.get("success", False):
    print("SLITHER EXECUTION FAILURE")
    print(json.dumps(data.get("error"), indent=2))
    sys.exit(2)

detectors = data.get("results", {}).get("detectors", []) or []
counts = Counter(d.get("impact", "Unknown") for d in detectors)

print("Slither detector counts:")
for impact in ["High","Medium","Low","Informational","Optimization","Unknown"]:
    print(f"  {impact}: {counts.get(impact,0)}")

high_medium = [d for d in detectors if d.get("impact") in {"High","Medium"}]

if high_medium:
    print("\nHIGH/MEDIUM DETECTORS:")
    for d in high_medium:
        print("-" * 80)
        print("Impact:", d.get("impact"))
        print("Confidence:", d.get("confidence"))
        print("Check:", d.get("check"))
        print(d.get("description","").strip())
    sys.exit(1)

print("PASS — no High/Medium Slither detectors")
