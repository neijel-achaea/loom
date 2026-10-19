#!/usr/bin/env python3
"""Smoke-test built packages against missing, late, odd and corrupt data.

Packages must degrade, never throw (#135). This runs every package in node,
with the Nexus calls stubbed, through these situations, and lists every
script that throws:

  - each package alone (fresh install, ordinary GMCP, every command, every
    tab drawn, every trigger fired), then reloaded and uninstalled
  - each package with loom only, so its integrations wait on the other side
  - no GMCP at all, and triggers, tabs and commands before the first GMCP
  - every package together, with odd GMCP payloads ({}, null, "", [] ...)
    and reloaded over itself (an upgrade)
  - each package with every saved variable it reads set to one bad value
    at a time (empty, broken JSON, wrong type, huge number ...)

It also flags an orange notice repeated on prompt after prompt (one notice
per problem, not one per prompt), and calls into packages that aren't
installed (listed, but they don't fail the run: Nexus logs and carries on).

    python3 tools/smoke.py              -> every package in dist/versions.json
    python3 tools/smoke.py room social  -> only those (others load as needed)
    python3 tools/smoke.py -v           -> with the first lines of each stack

Run it after building, like check.py. Exits 1 if anything throws. Needs node.
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main():
    args = sys.argv[1:]
    verbose = "-v" in args
    names = [a for a in args if not a.startswith("-")]
    known = json.load(open(os.path.join(ROOT, "dist", "versions.json")))["packages"]
    unknown = [n for n in names if n not in known]
    if unknown:
        sys.exit("not in dist/versions.json: " + ", ".join(unknown))
    opts = {"only": names, "verbose": verbose}
    r = subprocess.run(["node", os.path.join(ROOT, "tools", "smoke.js"), os.path.join(ROOT, "dist"), json.dumps(opts)])
    sys.exit(r.returncode)

if __name__ == "__main__":
    main()
