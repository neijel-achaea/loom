#!/usr/bin/env python3
"""Screenshots of every Loom tab for the player docs (#138).

    python3 tools/screens.py            write docs/img/<tab>.png
    python3 tools/screens.py <folder>   write them somewhere else

Builds nothing: run tools/build.py first. Needs node and playwright
(npm i -g playwright, with a Chromium installed for it). The data shown is
invented by tools/screens.js; nothing comes from a real character.
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "docs", "img")
    env = dict(os.environ)
    if "NODE_PATH" not in env:
        root = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()
        if root:
            env["NODE_PATH"] = root
    r = subprocess.run(["node", os.path.join(ROOT, "tools", "screens.js"), out], env=env)
    sys.exit(r.returncode)


if __name__ == "__main__":
    main()
