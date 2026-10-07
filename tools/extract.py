#!/usr/bin/env python3
"""Split a Nexus package (.nxs) into readable source files.

    python tools/extract.py MyExport.nxs            -> packages/<name>/
    python tools/extract.py MyExport.nxs --name foo -> packages/foo/

Every function body and every alias/trigger script becomes its own .js file;
package.json keeps everything else (names, patterns, options, order) and
points at those files. tools/build.py reverses this exactly.
"""
import json, os, re, sys, shutil

def slug(s):
    s = re.sub(r"[^A-Za-z0-9]+", "_", s or "").strip("_").lower()
    # Triggers are often named after their whole line: keep names readable.
    if len(s) > 40:
        s = s[:40].rsplit("_", 1)[0] or s[:40]
    return s or "unnamed"

def extract(nxs, name=None, root="packages"):
    d = json.load(open(nxs, encoding="utf-8"))
    name = name or slug(d.get("name") or os.path.splitext(os.path.basename(nxs))[0])
    out = os.path.join(root, name)
    if os.path.isdir(out):
        shutil.rmtree(out)
    os.makedirs(out)
    used = set()

    def fname(base):
        f, n = base + ".js", 2
        while f in used:
            f, n = "%s_%d.js" % (base, n), n + 1
        used.add(f)
        return f

    def walk(items, prefix=""):
        for it in items:
            t = it.get("type", "x")
            base = prefix + (slug(it.get("name")) if t == "function" else t + "_" + slug(it.get("name") or it.get("text")))
            if isinstance(it.get("code"), str):
                f = fname(base)
                open(os.path.join(out, f), "w", encoding="utf-8").write(it["code"])
                it["code"] = "@file:" + f
            for i, a in enumerate(it.get("actions") or []):
                if isinstance(a.get("script"), str):
                    f = fname(base + ("" if i == 0 else "_" + str(i)))
                    open(os.path.join(out, f), "w", encoding="utf-8").write(a["script"])
                    a["script"] = "@file:" + f
            if it.get("items"):
                walk(it["items"], prefix + slug(it.get("name")) + "__")

    walk(d.get("items") or [])
    json.dump(d, open(os.path.join(out, "package.json"), "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print("extracted %s -> %s (%d files)" % (nxs, out, len(used)))
    return out

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    nm = None
    if "--name" in args:
        i = args.index("--name"); nm = args[i + 1]; del args[i:i + 2]
    extract(args[0], nm)
