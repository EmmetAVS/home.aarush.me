import os
import json

files = list(os.listdir(str(os.getcwdb())[2:-1] + "/assets/backgrounds"))
if not os.path.exists("backgrounds.json"):
    with open("backgrounds.json", 'w') as f:
        f.write(json.dumps([]))

with open ("backgrounds.json", 'r') as f:
    try:
        current_files = json.loads(f.read())
    except:
        current_files = []
for item in files:
    if item not in current_files:
        current_files.append(item)
with open("backgrounds.json", 'w') as f:
    f.write(json.dumps(current_files, indent=2))