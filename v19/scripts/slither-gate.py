import json, sys
from collections import Counter

path=sys.argv[1]
with open(path,"r",encoding="utf-8") as f:
    data=json.load(f)

if not data.get("success",False):
    print("SLITHER EXECUTION FAILURE")
    sys.exit(2)

detectors=data.get("results",{}).get("detectors",[]) or []
counts=Counter(d.get("impact","Unknown") for d in detectors)
print("Slither counts:",dict(counts))

blocking=[d for d in detectors if d.get("impact") in {"High","Medium"}]
if blocking:
    for d in blocking:
        print("-"*72)
        print(d.get("impact"),d.get("confidence"),d.get("check"))
        print(d.get("description","").strip())
    sys.exit(1)

print("PASS — no High/Medium Slither detectors");
