#!/usr/bin/env python3
"""Syntax-check every script in built packages, as Nexus will run them.

Each function's code and each alias's or trigger's script is compiled (not
run) by node as a plain script, as Nexus runs them: a top-level `return`, an
unclosed brace or a stray character fails here instead of in game.

    python3 tools/check.py            -> every dist/*.nxs
    python3 tools/check.py self room  -> only those

Run it after building. Exits 1 if any script fails. Needs node.
"""
import glob, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CHECK = r"""
const fs = require("fs"), vm = require("vm");
let bad = 0, n = 0;
for (const path of process.argv.slice(1)) {
  const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
  const walk = (items, where) => {
    for (const it of items || []) {
      const name = (it.type || "item") + " " + (it.name || it.text || "(unnamed)");
      const bodies = [];
      if (typeof it.code === "string") bodies.push(it.code);
      for (const a of it.actions || []) if (typeof a.script === "string" && a.script) bodies.push(a.script);
      for (const b of bodies) {
        n++;
        try { new vm.Script(b); }
        catch (e) { bad++; console.log(where + ": " + name + ": " + e.message); }
      }
      if (it.items) walk(it.items, where);
    }
  };
  walk(pkg.items, path.split("/").pop());
}
console.log(n + " scripts checked, " + bad + " failed");
process.exit(bad ? 1 : 0);
"""

def main():
    names = sys.argv[1:]
    paths = [os.path.join(ROOT, "dist", n + ".nxs") for n in names] if names else sorted(glob.glob(os.path.join(ROOT, "dist", "*.nxs")))
    missing = [p for p in paths if not os.path.exists(p)]
    if missing:
        sys.exit("not built: " + ", ".join(os.path.basename(p) for p in missing))
    r = subprocess.run(["node", "-e", CHECK] + paths)
    sys.exit(r.returncode)

if __name__ == "__main__":
    main()
