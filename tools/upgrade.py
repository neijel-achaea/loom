#!/usr/bin/env python3
"""Import the current build over every release and check nothing was lost.

Players import new versions over old ones; nothing they set up may be lost
(#134). For each release since 0.2 (its git tag), this runs the release's
packages in node (sim.js, the same stubbed Nexus page as smoke.py), sets
them up the way a player would (every setting command its HELP lists, run
with a value that isn't the default), then:

  - imports the current build over it, one package at a time in the same
    page (alphabetically; on a second pass in the opposite order, with the
    other value of each ON|OFF), so new packages meet old ones mid-way
  - logs in again with the current build (a fresh page, same variables)
  - goes back to the release (a downgrade), which may start fresh but must
    not throw (old code can't change, so a throw there means the current
    build reshaped something under a name the release still reads)

and checks every saved variable against docs/dev/variables.md:

  - a setting must keep its value, or be migrated (the new row's *Was*
    names it, and the new variable is set)
  - data must still be there (its value changes as you play)
  - nothing still saved may be left unread by the current build (a rename
    without a migration)
  - every variable the current build uses must be listed, and every listed
    one used
  - nothing in the current build may throw while being imported

    python3 tools/upgrade.py                    -> every release since 0.2
    python3 tools/upgrade.py loom-v0.6.0        -> only that release
    python3 tools/upgrade.py -v                 -> also the commands typed and
                                                   the settings each release saved

Release tags missing from a shallow clone are fetched (depth 1). Run it after
building, with check.py and smoke.py. Exits 1 on any problem. Needs node and git.
"""
import json, os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# v0.1 shipped other package names (common, defences, eleusis, talismans):
# there is no import-over path from it, so the check starts at 0.2.
FIRST = (0, 2)


def git(*args, check=True):
    return subprocess.run(["git", "-C", ROOT] + list(args), capture_output=True, text=True, check=check)


def version(tag):
    m = re.match(r"^(?:loom-)?v\.?(\d+)\.(\d+)", tag)
    return (int(m.group(1)), int(m.group(2))) if m else None


def release_tags():
    tags = set(git("tag", "-l").stdout.split())
    remote = git("ls-remote", "--tags", "origin", check=False)
    if remote.returncode == 0:
        for line in remote.stdout.splitlines():
            ref = line.split("\t")[-1]
            if ref.startswith("refs/tags/") and not ref.endswith("^{}"):
                tags.add(ref[len("refs/tags/"):])
    out = [t for t in tags if version(t) and version(t) >= FIRST]
    return sorted(out, key=version)


def main():
    args = sys.argv[1:]
    verbose = "-v" in args
    wanted = [a for a in args if not a.startswith("-")]
    tags = release_tags()
    if not tags:
        sys.exit("no release tags found (git tag -l, git ls-remote)")
    latest = version(tags[-1])
    nxt = "%d.%d" % (latest[0], latest[1] + 1)
    if wanted:
        unknown = [t for t in wanted if t not in tags]
        if unknown:
            sys.exit("not a release tag: " + ", ".join(unknown) + " (have: " + ", ".join(tags) + ")")
        tags = wanted
    tmp = tempfile.mkdtemp(prefix="loom-upgrade-")
    try:
        releases, skipped = [], []
        for tag in tags:
            if git("rev-parse", "-q", "--verify", "refs/tags/" + tag, check=False).returncode != 0:
                git("fetch", "-q", "--depth", "1", "origin", "tag", tag, "--no-tags", check=False)
            dest = os.path.join(tmp, tag)
            os.makedirs(dest)
            arch = subprocess.run(["git", "-C", ROOT, "archive", tag, "dist"], capture_output=True)
            if arch.returncode != 0:
                skipped.append(tag)
                continue
            subprocess.run(["tar", "-x", "-C", dest], input=arch.stdout, check=True)
            releases.append({"tag": tag, "dist": os.path.join(dest, "dist")})
        if skipped:
            print("skipped (tag not reachable): " + ", ".join(skipped))
        if not releases:
            sys.exit("no release could be read")
        opts = {
            "current": os.path.join(ROOT, "dist"),
            "releases": releases,
            "inventory": os.path.join(ROOT, "docs", "dev", "variables.md"),
            "next": nxt,
            "verbose": verbose,
        }
        r = subprocess.run(["node", os.path.join(ROOT, "tools", "upgrade.js"), json.dumps(opts)])
        sys.exit(r.returncode)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
