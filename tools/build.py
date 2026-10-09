#!/usr/bin/env python3
"""Build Nexus packages (.nxs) from packages/<name>/.

Each package's "description" (at most 80 characters) is checked, and fills
the "{{description}}" placeholder in its registry line.

    python tools/build.py            -> every package into dist/
    python tools/build.py self coffers
"""
import glob, json, os, sys

def resolve(node, folder):
    if isinstance(node, dict):
        return {k: resolve(v, folder) for k, v in node.items()}
    if isinstance(node, list):
        return [resolve(v, folder) for v in node]
    if isinstance(node, str) and node.startswith("@file:"):
        return open(os.path.join(folder, node[6:]), encoding="utf-8").read()
    if isinstance(node, str) and node.startswith("@cat:"):
        # "@cat:head.js classes/*.js": the files joined in the order given,
        # each pattern's matches sorted by name. Used for data split one file
        # per class, which Nexus still receives as one function.
        parts = []
        for pattern in node[5:].split():
            matches = sorted(glob.glob(os.path.join(folder, pattern)))
            if not matches:
                sys.exit("%s: %s matches no file" % (folder, pattern))
            parts += [open(m, encoding="utf-8").read() for m in matches]
        return "\n".join(parts)
    return node

MAX_DESCRIPTION = 80
PLACEHOLDER = '"{{description}}"'

def fill(node, value):
    """Put the package's description, as a JS string, where the code has the
    "{{description}}" placeholder (the registry line), so it is written once."""
    if isinstance(node, dict):
        return {k: fill(v, value) for k, v in node.items()}
    if isinstance(node, list):
        return [fill(v, value) for v in node]
    if isinstance(node, str):
        return node.replace(PLACEHOLDER, value)
    return node

def build(name, root="packages", dist="dist"):
    folder = os.path.join(root, name)
    d = resolve(json.load(open(os.path.join(folder, "package.json"), encoding="utf-8")), folder)
    # The description is what Nexus shows on its packages page and what LOOM
    # shows under the package: required, one line, at most 80 characters.
    desc = d.get("description", "")
    if not desc or "\n" in desc or len(desc) > MAX_DESCRIPTION:
        sys.exit("%s: the description must be one line of 1-%d characters (it is %d)" % (name, MAX_DESCRIPTION, len(desc)))
    d = fill(d, json.dumps(desc, ensure_ascii=False))
    os.makedirs(dist, exist_ok=True)
    path = os.path.join(dist, name + ".nxs")
    json.dump(d, open(path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("built", path)

if __name__ == "__main__":
    names = sys.argv[1:] or sorted(n for n in os.listdir("packages") if os.path.isfile(os.path.join("packages", n, "package.json")))
    for n in names:
        build(n)
