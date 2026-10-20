#!/usr/bin/env python3
"""Split a Nexus package (.nxs) into readable source files.

    python tools/extract.py MyExport.nxs            -> packages/<name>/
    python tools/extract.py MyExport.nxs --name foo -> packages/foo/

Every function body and every alias/trigger script becomes its own .js file;
package.json keeps everything else (names, patterns, options, order) and
points at those files. tools/build.py reverses this exactly.

A built package's longer scripts are stubs whose bodies live in the
generated <pkg>__hot function (see tools/build.py, #136): those are put back
in place, and the generated function dropped, before anything is written.
"""
import json, os, re, sys, shutil

def slug(s):
    s = re.sub(r"[^A-Za-z0-9]+", "_", s or "").strip("_").lower()
    # Triggers are often named after their whole line: keep names readable.
    if len(s) > 40:
        s = s[:40].rsplit("_", 1)[0] or s[:40]
    return s or "unnamed"

HOT_TAG = "/*loom-hot "
HOT_BODY = re.compile(r"^//@hot-begin (\S+)\n(.*?)\n//@hot-end \1$", re.S | re.M)

def unhot(d):
    """Put each stub's body back from the generated <pkg>__hot function."""
    items = d.get("items") or []
    gen = [it for it in items if it.get("type") == "function" and str(it.get("name", "")).endswith("__hot")
           and isinstance(it.get("code"), str) and "//@hot-begin " in it["code"]]
    if not gen:
        return d
    bodies = {}
    for g in gen:
        for m in HOT_BODY.finditer(g["code"]):
            bodies[m.group(1)] = m.group(2)
    def fix(holder, field):
        v = holder.get(field)
        if isinstance(v, str) and v.startswith(HOT_TAG):
            key = v[len(HOT_TAG):].split("*/", 1)[0].split()[1]
            if key not in bodies:
                sys.exit("stub for %s has no body in the generated __hot function" % key)
            holder[field] = bodies[key]
    def walk(its):
        for it in its or []:
            fix(it, "code")
            for a in it.get("actions") or []:
                fix(a, "script")
            walk(it.get("items"))
    walk(items)
    d["items"] = [it for it in items if it not in gen]
    return d

def extract(nxs, name=None, root="packages"):
    d = unhot(json.load(open(nxs, encoding="utf-8")))
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
