#!/usr/bin/env python3
"""Write dist/versions.json: every built package and the version it registers.

LOOM UPDATES fetches this file from main and compares it with the packages
loaded in game. The version is read from the built .nxs (what players
import), from its `client.loom.registry.<name> = { version: "x.y.z" ...`.

    python3 tools/versions.py          -> writes dist/versions.json
    python3 tools/versions.py --check  -> fails if the file is out of date

The workflow .github/workflows/versions.yml runs this on every push to main,
so branches don't need to commit it (and don't conflict over it).
"""
import glob, json, os, re, sys

DIST = "dist"
OUT = os.path.join(DIST, "versions.json")

def versions():
    found = {}
    for path in sorted(glob.glob(os.path.join(DIST, "*.nxs"))):
        name = os.path.splitext(os.path.basename(path))[0]
        text = open(path, encoding="utf-8").read()
        m = re.search(r'registry\.%s = \{ version: \\?"([0-9.]+)\\?"' % re.escape(name), text)
        if m:
            found[name] = m.group(1)
        else:
            print("no registry version in", path, file=sys.stderr)
    return found

def render(found):
    return json.dumps({"packages": found}, indent=1, sort_keys=True) + "\n"

if __name__ == "__main__":
    text = render(versions())
    if "--check" in sys.argv:
        old = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
        if old != text:
            sys.exit("dist/versions.json is out of date: run python3 tools/versions.py")
        print("dist/versions.json is up to date")
    else:
        open(OUT, "w", encoding="utf-8").write(text)
        print("wrote", OUT)
