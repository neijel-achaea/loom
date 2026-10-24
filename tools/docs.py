#!/usr/bin/env python3
"""Fill the generated parts of docs/*.md from the packages, so they can't drift.

A page marks what is generated; everything around the markers is written by
hand and left alone.

    <!-- loom:commands coffers -->
    (the package's HELP table, as a Markdown table)
    <!-- /loom:commands -->

    <!-- loom:version coffers -->
    (one line: which version of the package the page describes)
    <!-- /loom:version -->

    <!-- loom:links all -->
    (every integration in packages/loom/loom_links.js: id, from, to, what it does)
    <!-- /loom:links -->

    <!-- loom:classes all -->
    (one regression row per class, from packages/hunting/classes/*.js)
    <!-- /loom:classes -->

The HELP table is the `hlRows` literal in packages/<pkg>/<pkg>_help.js:
[command, what it does] rows, and one-element rows for section lines. The
version is the one the package registers (`registry.<pkg> = { version: ...`).

    python3 tools/docs.py          -> rewrite every page whose blocks are stale
    python3 tools/docs.py --check  -> change nothing; exit 1 if any page is stale

Needs node (the HELP tables are JavaScript, read with node rather than parsed
by hand).
"""
import glob, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")
PACKAGES = os.path.join(ROOT, "packages")

BLOCK = re.compile(r"(<!-- loom:(commands|version|links|classes) (\w+) -->\n)(.*?)(<!-- /loom:\2 -->)", re.S)

READ_ROWS = r"""
const s = require("fs").readFileSync(process.argv[1], "utf8");
const t = /^var hlTitle = (".*?");\s*$/m.exec(s);
const m = /^var hlRows = (\[[\s\S]*?\n\]);/m.exec(s);
if (!m) { console.error(process.argv[1] + ": no hlRows table"); process.exit(1); }
// Some rows are built at run time (defcon's and hunting's "Classes set up"
// note): any name the table uses stands for a placeholder, and rows holding
// one are left out; the page says that part in its own words.
const HOLE = {};
const scope = new Proxy({}, { has: (o, k) => typeof k === "string" && !(k in globalThis), get: () => HOLE });
const rows = new Function("scope", "with (scope) { return " + m[1] + "; }")(scope)
  .filter(r => r.every(x => typeof x === "string"));
const title = t ? new Function("return " + t[1])() : "";
process.stdout.write(JSON.stringify({ title: title, rows: rows }));
"""

# One checklist row per class for docs/dev/regression.md: F1, the rage
# abilities, the shieldbreak, F11 and toggles, read from the class files.
CLASS_ROWS = r"""
const fs = require("fs"), path = require("path");
const dir = process.argv[1];
global.HU = { classes: {} }; global.huQ = "";
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".js")).sort()) eval(fs.readFileSync(path.join(dir, f), "utf8"));
const rows = [];
const seen = new Set();
for (const name of Object.keys(HU.classes).sort()) {
  const c = HU.classes[name];
  // An alias for the same table ("Golden Dragon" for "Gold Dragon") gets no row of its own.
  if (seen.has(c)) continue;
  seen.add(c);
  const razes = c.razes || [];
  let f1;
  if (/Dragon/.test(name)) f1 = "Gut or Incantation, by the F8 mode";
  else if (c.weapons && !c.mains) f1 = "by weapon specialisation";
  else f1 = Object.values(c.mains || {}).map(m => m[0]).join(", ");
  const rage = Object.keys(c.rage || {}).filter(r => !razes.includes(r));
  const k11 = (c.keys || [])[10] || ["", ""];
  let f11 = k11[0];
  const tg = /^\{toggle:(\w+)\}$/.exec(f11);
  if (tg) f11 = tg[1].charAt(0).toUpperCase() + tg[1].slice(1) + " toggle";
  if (/^\{|^Shield$|^Diag$/.test(f11)) f11 = "";
  const toggles = Object.keys(c.toggles || {}).map(t => t.charAt(0).toUpperCase() + t.slice(1)).filter(t => !(f11 === t + " toggle"));
  let r = "- [ ] **" + name + "**: F1 " + f1 + "; rage: " + rage.join(", ") + "; shieldbreak: " + razes.join(", ") + " (on a shielded mob)";
  if (f11) r += "; F11: " + f11;
  if (toggles.length) r += "; toggle" + (toggles.length > 1 ? "s" : "") + ": " + toggles.join(", ");
  rows.push(r);
}
console.log(rows.join("\n"));
"""

def classes_md():
    out = subprocess.run(["node", "-e", CLASS_ROWS, os.path.join(PACKAGES, "hunting", "classes")], capture_output=True, text=True)
    if out.returncode:
        sys.exit(out.stderr.strip())
    return out.stdout

def help_table(pkg):
    path = os.path.join(PACKAGES, pkg, pkg + "_help.js")
    if not os.path.exists(path):
        sys.exit("%s: no %s_help.js" % (pkg, pkg))
    out = subprocess.run(["node", "-e", READ_ROWS, path], capture_output=True, text=True)
    if out.returncode:
        sys.exit(out.stderr.strip())
    return json.loads(out.stdout)

def version(pkg):
    pat = re.compile(r'registry\.%s = \{ version: "([\d.]+)"' % re.escape(pkg))
    for f in sorted(glob.glob(os.path.join(PACKAGES, pkg, "*.js"))):
        m = pat.search(open(f, encoding="utf-8").read())
        if m:
            return m.group(1)
    sys.exit("%s: no registry version found" % pkg)

def cell(text):
    # Pipes would end the cell; inside a code span GitHub still honours \|.
    return text.replace("|", "\\|")

def commands_md(pkg):
    data = help_table(pkg)
    lines = ["| Command | What it does |", "|---|---|"]
    for row in data["rows"]:
        if len(row) > 1:
            lines.append("| `%s` | %s |" % (cell(row[0]), cell(row[1])))
        else:
            lines.append("| **%s** | |" % cell(row[0]))
    return "\n".join(lines) + "\n"

def version_md(pkg):
    return "*This page describes %s %s.*\n" % (pkg, version(pkg))

LINK = re.compile(r'id:\s*"([a-z_-]+)",\s*src:\s*"(\w+)",\s*dst:\s*"(\w+)"[\s\S]*?desc:\s*"((?:[^"\\\\]|\\\\.)*)"')

def pkg_link(pkg):
    # The package's page when it has one, else its name in bold.
    if os.path.exists(os.path.join(DOCS, pkg + ".md")):
        return "[%s](%s.md)" % (pkg, pkg)
    return "**%s**" % pkg

def links_md():
    src = open(os.path.join(PACKAGES, "loom", "loom_links.js"), encoding="utf-8").read()
    rows = LINK.findall(src)
    if not rows:
        sys.exit("loom_links.js: no links found")
    lines = ["| Link | From | To | What it does |", "|---|---|---|---|"]
    for lid, s_, d_, desc in rows:
        lines.append("| `%s` | %s | %s | %s |" % (lid, pkg_link(s_), pkg_link(d_), cell(desc.replace("\\'", "'"))))
    return "\n".join(lines) + "\n"

def fill(text):
    def repl(m):
        kind, pkg = m.group(2), m.group(3)
        if kind == "commands":
            body = commands_md(pkg)
        elif kind == "links":
            body = links_md()
        elif kind == "classes":
            body = classes_md()
        else:
            body = version_md(pkg)
        return m.group(1) + body + m.group(5)
    return BLOCK.sub(repl, text)

def main():
    check = "--check" in sys.argv[1:]
    stale = []
    for page in sorted(glob.glob(os.path.join(DOCS, "*.md")) + glob.glob(os.path.join(DOCS, "dev", "*.md"))):
        old = open(page, encoding="utf-8").read()
        new = fill(old)
        if new != old:
            stale.append(os.path.relpath(page, ROOT))
            if not check:
                open(page, "w", encoding="utf-8").write(new)
    if check:
        if stale:
            print("stale (run python3 tools/docs.py): " + ", ".join(stale))
            sys.exit(1)
        print("docs up to date")
    else:
        print("updated: " + ", ".join(stale) if stale else "docs up to date")

if __name__ == "__main__":
    main()
