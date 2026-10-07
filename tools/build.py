#!/usr/bin/env python3
"""Build Nexus packages (.nxs) from packages/<name>/.

    python tools/build.py            -> every package into dist/
    python tools/build.py self coffers
"""
import json, os, sys

def resolve(node, folder):
    if isinstance(node, dict):
        return {k: resolve(v, folder) for k, v in node.items()}
    if isinstance(node, list):
        return [resolve(v, folder) for v in node]
    if isinstance(node, str) and node.startswith("@file:"):
        return open(os.path.join(folder, node[6:]), encoding="utf-8").read()
    return node

def build(name, root="packages", dist="dist"):
    folder = os.path.join(root, name)
    d = resolve(json.load(open(os.path.join(folder, "package.json"), encoding="utf-8")), folder)
    os.makedirs(dist, exist_ok=True)
    path = os.path.join(dist, name + ".nxs")
    json.dump(d, open(path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("built", path)

if __name__ == "__main__":
    names = sys.argv[1:] or sorted(n for n in os.listdir("packages") if os.path.isfile(os.path.join("packages", n, "package.json")))
    for n in names:
        build(n)
