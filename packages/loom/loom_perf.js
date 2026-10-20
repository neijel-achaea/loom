// loom_perf -- LOOM PERF (#209): what the packages cost while you play.
// Run from onLoad/onInstall; defines L.perf (start, stop, data). Nothing is
// measured, and nothing wrapped, unless a sample is running.
//
// How it measures (found by probing the client, 2026-10-20): package scripts
// see `client` as Nexus's own nexusclient, and every script the client runs
// (function bodies, trigger and alias scripts) goes through
// client.exec_script(code, args, package, label). A sample wraps that one
// method, plus _reflexes.handle_triggers (each game line), the triggers'
// shared do_matching (each pattern tried) and _datahandler.handle_GMCP (each
// GMCP message), with performance.now(). Stopping puts every one back.
if (!client.loom) client.loom = {};
if (!client.loom.loom) client.loom.loom = {};
var L = client.loom.loom;

// A sample left running by an earlier copy of this script (loom reimported
// mid-sample) is ended first, so no wrapper outlives the code that knows it.
if (client.__loomPerfRestore) { try { client.__loomPerfRestore(); } catch (e) {} client.__loomPerfRestore = null; }
L.perfState = null;

L.perfNow = function () { return (typeof performance != "undefined" && performance.now) ? performance.now() : Date.now(); };
L.perfMin = 5;
L.perfMax = 600;
L.perfDefault = 60;
// A single call longer than one frame at 60 fps is worth a look.
L.perfSlow = 16;

// Can this client be measured? Lists what's missing.
L.perfMissing = function () {
  var miss = [];
  if (typeof client.exec_script != "function") miss.push("exec_script");
  return miss;
};

// Which script ran: "Function [name]" labels name themselves; trigger and
// alias scripts are often unnamed, so their first comment line stands in.
L.perfWhat = function (code, label, trig) {
  var lb = String(label || "");
  var m = /^(\w+)\s*\[(.*)\]\s*$/.exec(lb);
  var kind = m ? m[1].toLowerCase() : (lb ? lb.split(/\s/)[0].toLowerCase() : "script");
  var name = m ? m[2] : "";
  // Unnamed: the script's opening comment says what it is (house style);
  // failing that, a trigger's pattern; failing that, its first line.
  var first = String(code || "").replace(/^\s+/, "").split("\n")[0];
  if (!name && /^\/\//.test(first)) name = first.replace(/^\/\/\s*/, "");
  if (!name && kind === "trigger" && trig) {
    var pat = trig.text !== undefined ? trig.text : trig.regexp;
    if (pat) name = "/" + String(pat) + "/";
  }
  if (!name) name = first;
  if (name.length > 44) name = name.substring(0, 43) + "…";
  return { kind: kind, name: name || "(unnamed)" };
};

L.perfStart = function (secs) {
  if (L.perfState) return "running";
  var miss = L.perfMissing();
  if (miss.length) return "missing";
  var now = L.perfNow;
  // The clock's step: Firefox, for one, rounds to whole milliseconds.
  var g0 = now(), g1 = g0, gN = 0;
  while (g1 === g0 && gN < 5000000) { g1 = now(); gN++; }
  var g2 = g1; gN = 0;
  while (g2 === g1 && gN < 5000000) { g2 = now(); gN++; }
  var st = {
    grain: Math.max(0, g2 - g1),
    t0: now(), wall0: Date.now(), secs: secs, done: false,
    stack: [], scripts: {}, pkgs: {}, gmcp: {}, lines: 0, lineMs: 0, execInLines: 0,
    matchPkg: {}, gmcpCount: 0, inLine: false,
  };
  var pkgOf = function (p) { return p ? String(p) : "(yours)"; };
  var pk = function (p) { return st.pkgs[p] || (st.pkgs[p] = { self: 0, calls: 0, worst: 0, worstWhat: "", match: 0 }); };
  var undo = [];
  // Wraps obj[key] for the sample; undo puts back exactly what was there.
  var wrap = function (obj, key, make) {
    if (!obj || typeof obj[key] != "function") return false;
    var own = Object.prototype.hasOwnProperty.call(obj, key), orig = obj[key];
    obj[key] = make(orig);
    undo.push(function () { if (own) obj[key] = orig; else delete obj[key]; });
    return true;
  };

  wrap(client, "exec_script", function (orig) {
    return function (code, a, p, label) {
      var fr = { t: now(), child: 0 };
      st.stack.push(fr);
      try { return orig.apply(this, arguments); }
      finally {
        st.stack.pop();
        var d = now() - fr.t, self = d - fr.child;
        if (st.stack.length) st.stack[st.stack.length - 1].child += d;
        else if (st.inLine) st.execInLines += d;
        var pn = pkgOf(p), w = L.perfWhat(code, label, st.lastTrig), key = pn + "\u0000" + w.kind + "\u0000" + w.name;
        var r = st.scripts[key] || (st.scripts[key] = { pkg: pn, kind: w.kind, name: w.name, calls: 0, self: 0, max: 0 });
        r.calls++; r.self += self; if (d > r.max) r.max = d;
        var P = pk(pn); P.self += self; P.calls++;
        if (d > P.worst) { P.worst = d; P.worstWhat = w.kind + " " + w.name; }
      }
    };
  });

  var RX = client._reflexes;
  wrap(RX, "handle_triggers", function (orig) {
    return function () {
      var t = now(), was = st.inLine;
      st.inLine = true;
      try { return orig.apply(this, arguments); }
      finally { st.inLine = was; st.lines++; st.lineMs += now() - t; }
    };
  });
  // Each pattern tried, by package: what its triggers cost on every line,
  // matched or not. The triggers share do_matching on their prototype.
  var trig = null;
  try { var al = RX && RX.get_active_list ? RX.get_active_list("trigger") : []; trig = al && al.length ? Object.getPrototypeOf(al[0]) : null; } catch (e) { trig = null; }
  var owner = typeof WeakMap != "undefined" ? new WeakMap() : null;
  // The package a trigger belongs to: its top group, reached through `p`
  // (the client's own package_for_reflex climbs a field these don't have).
  var pkgNames = {};
  try { var pls = client._packages.list(); for (var pi = 0; pi < pls.length; pi++) pkgNames[pls[pi].name] = true; } catch (e) {}
  var ownerOf = function (rx) {
    if (owner && owner.has(rx)) return owner.get(rx);
    var n = "(yours)", x = rx;
    try {
      for (var d = 0; x && d < 30; d++) {
        if (x.is_package || (!x.p && x !== rx)) { if (x.is_package || pkgNames[x.name]) n = String(x.name); break; }
        x = x.p;
      }
    } catch (e) {}
    if (owner) owner.set(rx, n);
    return n;
  };
  if (trig) wrap(trig, "do_matching", function (orig) {
    return function () {
      var t = now(), m = null;
      try { m = orig.apply(this, arguments); return m; }
      finally {
        var n = ownerOf(this);
        st.matchPkg[n] = (st.matchPkg[n] || 0) + (now() - t);
        // The trigger whose script runs next, for its label.
        if (m) st.lastTrig = this;
      }
    };
  });
  wrap(client._datahandler, "handle_GMCP", function (orig) {
    return function (method) {
      var t = now();
      try { return orig.apply(this, arguments); }
      finally {
        var d = now() - t, g = st.gmcp[method] || (st.gmcp[method] = { calls: 0, ms: 0, max: 0 });
        g.calls++; g.ms += d; if (d > g.max) g.max = d; st.gmcpCount++;
      }
    };
  });

  st.restore = function () { while (undo.length) { try { undo.pop()(); } catch (e) {} } };
  client.__loomPerfRestore = st.restore;
  L.perfState = st;
  st.timer = setTimeout(function () { if (L.perfState === st) L.perfStop(); }, secs * 1000);
  return "started";
};

// Ends the sample (or does nothing), puts everything back, prints the report.
L.perfStop = function () {
  var st = L.perfState;
  if (!st || st.done) return false;
  st.done = true;
  st.restore();
  client.__loomPerfRestore = null;
  try { clearTimeout(st.timer); } catch (e) {}
  st.elapsed = Math.max(1, L.perfNow() - st.t0);
  L.perfState = null;
  L.perfReport(st);
  return true;
};

// Saved data by package: every variable, by its package's prefix.
L.perfData = function () {
  var vars = (client._variables && client._variables.vars && typeof client._variables.vars == "object") ? client._variables.vars : null;
  if (!vars) return null;
  var names = Object.keys(client.loom.registry || {}).sort(function (a, b) { return b.length - a.length; });
  var out = {}, total = 0;
  for (var k in vars) {
    if (!Object.prototype.hasOwnProperty.call(vars, k)) continue;
    var v = vars[k], s;
    try { s = typeof v == "string" ? v.length : JSON.stringify(v).length; } catch (e) { s = 0; }
    if (!s) continue;
    var p = "(other)";
    for (var i = 0; i < names.length; i++) if (k.indexOf(names[i] + "_") === 0) { p = names[i]; break; }
    var o = out[p] || (out[p] = { size: 0, n: 0, big: "", bigSize: 0 });
    o.size += s; o.n++; total += s;
    if (s > o.bigSize) { o.bigSize = s; o.big = k; }
  }
  return { pkgs: out, total: total };
};

// ---- Printing -----------------------------------------------------------
L.perfFmtMs = function (ms) { return ms >= 100 ? Math.round(ms) + " ms" : ms >= 10 ? ms.toFixed(1) + " ms" : ms.toFixed(2) + " ms"; };
L.perfFmtN = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
L.perfFmtKB = function (c) { return c >= 1024 * 1024 ? (c / 1048576).toFixed(1) + " MB" : c >= 1024 ? (c / 1024).toFixed(1) + " KB" : c + " B"; };

// Lines of [text, colour] cells, printed as one monospace block.
L.perfPrint = function (title, rows) {
  var esc = function (t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  var html = (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function");
  display_notice(title, "cyan");
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!html) { display_notice("  " + r.map(function (c) { return c[0]; }).join(""), "cyan"); continue; }
    out.push("  " + r.map(function (c) { return '<span style="color:' + (c[1] || "#9fc9c9") + '">' + esc(c[0]) + "</span>"; }).join(""));
  }
  if (html && out.length) nexusclient.add_html_line('<div style="font-family:monospace;white-space:pre">' + out.join("<br>") + "</div>");
};
L.perfPad = function (s, w, right) {
  s = String(s);
  if (s.length > w) s = s.substring(0, w - 1) + "…";
  var sp = new Array(w - s.length + 1).join(" ");
  return right ? sp + s : s + sp;
};

L.perfReport = function (st) {
  var pad = L.perfPad, n = L.perfFmtN;
  // A coarse clock (a step of half a millisecond or more) shows whole ms:
  // decimals would only be noise. Totals over many calls stay fair.
  var coarse = st.grain >= 0.5;
  var ms = coarse ? function (v) { return (v < 1 && v > 0 ? "<1" : String(Math.round(v))) + " ms"; } : L.perfFmtMs;
  var H = "#00ffff", T = "#9fc9c9", W = "#e6c25a";
  var secs = st.elapsed / 1000;
  var scriptMs = 0, k;
  for (k in st.pkgs) scriptMs += st.pkgs[k].self;
  var matchMs = 0;
  for (k in st.matchPkg) { matchMs += st.matchPkg[k]; (st.pkgs[k] || (st.pkgs[k] = { self: 0, calls: 0, worst: 0, worstWhat: "", match: 0 })).match = st.matchPkg[k]; }
  // No per-pattern figures (no trigger to hook): the lines' time less the scripts they ran.
  if (!matchMs && st.lines) matchMs = Math.max(0, st.lineMs - st.execInLines);
  var busy = scriptMs + matchMs;
  var rows = [];
  rows.push([[n(st.lines) + " game lines, " + n(st.gmcpCount) + " GMCP messages. Package scripts took " + ms(scriptMs) + ", trigger matching " + ms(matchMs) + ": " + (busy / st.elapsed * 100).toFixed(2) + "% of the time.", T]]);
  // Each game line, in all: the patterns tried, the trigger scripts they ran,
  // and the rest (the client's own work on the line).
  if (st.lines) {
    var lineMatch = 0;
    for (k in st.matchPkg) lineMatch += st.matchPkg[k];
    var other = Math.max(0, st.lineMs - lineMatch - st.execInLines);
    rows.push([["Game lines took " + ms(st.lineMs) + " in all: " + (lineMatch ? "patterns " + ms(lineMatch) + ", " : "") + "trigger scripts " + ms(st.execInLines) + ", the client's own work " + ms(other) + ".", T]]);
  }
  rows.push([[""]]);

  // Per package, costliest first.
  var pl = Object.keys(st.pkgs).sort(function (a, b) { return (st.pkgs[b].self + st.pkgs[b].match) - (st.pkgs[a].self + st.pkgs[a].match); });
  var nw = 12;
  for (var i = 0; i < pl.length; i++) if (pl[i].length + 1 > nw) nw = Math.min(16, pl[i].length + 1);
  rows.push([[pad("package", nw) + pad("scripts", 10, true) + pad("calls", 8, true) + pad("matching", 10, true) + "   slowest call", H]]);
  for (i = 0; i < pl.length && i < 30; i++) {
    var P = st.pkgs[pl[i]];
    rows.push([
      [pad(pl[i], nw) + pad(ms(P.self), 10, true) + pad(n(P.calls), 8, true) + pad(P.match ? ms(P.match) : "-", 10, true) + "   ", T],
      [P.calls ? pad(ms(P.worst), 9, true) : "", P.worst >= L.perfSlow ? W : T],
      [P.calls ? "  " + P.worstWhat : "", T],
    ]);
  }

  // The costliest pieces of work.
  var sl = [];
  for (k in st.scripts) sl.push(st.scripts[k]);
  sl.sort(function (a, b) { return b.self - a.self; });
  if (sl.length) {
    rows.push([[""]]);
    rows.push([[pad("costliest scripts", 46) + pad("package", 13) + pad("calls", 7, true) + pad("total", 10, true) + pad("avg", 10, true) + pad("max", 10, true), H]]);
    for (i = 0; i < sl.length && i < 12; i++) {
      var s = sl[i];
      rows.push([
        [pad(s.kind + " " + s.name, 46) + pad(s.pkg, 13) + pad(n(s.calls), 7, true) + pad(ms(s.self), 10, true) + pad(ms(s.self / s.calls), 10, true), T],
        [pad(ms(s.max), 10, true), s.max >= L.perfSlow ? W : T],
      ]);
    }
  }

  // GMCP: the client's own handling of each message, every onGMCP included.
  var gl = Object.keys(st.gmcp).sort(function (a, b) { return st.gmcp[b].ms - st.gmcp[a].ms; });
  if (gl.length) {
    rows.push([[""]]);
    rows.push([[pad("GMCP message (all handling)", 34) + pad("count", 8, true) + pad("total", 10, true) + pad("max", 10, true), H]]);
    for (i = 0; i < gl.length && i < 8; i++) {
      var g = st.gmcp[gl[i]];
      rows.push([[pad(gl[i], 34) + pad(n(g.calls), 8, true) + pad(ms(g.ms), 10, true), T], [pad(ms(g.max), 10, true), g.max >= L.perfSlow ? W : T]]);
    }
  }
  L.perfDataRows(rows);
  rows.push([[""]]);
  if (coarse) rows.push([["This browser's clock ticks every " + (Math.round(st.grain * 10) / 10) + " ms, so a single call reads as 0, 1, 2 ms…; totals over many calls even out.", T]]);
  rows.push([["Times are the scripts' own (a function called from another counts under itself). Measuring adds a little to every figure. Yellow: one call over " + L.perfSlow + " ms, a frame at 60 fps.", T]]);
  L.perfPrint("[loom] PERF: " + (secs < 10 ? secs.toFixed(1) : Math.round(secs)) + " s sample", rows);
};

// The saved-data block (also LOOM PERF DATA on its own).
L.perfDataRows = function (rows) {
  var pad = L.perfPad, kb = L.perfFmtKB;
  var d = L.perfData();
  if (!d) return;
  var dl = Object.keys(d.pkgs).sort(function (a, b) { return d.pkgs[b].size - d.pkgs[a].size; });
  rows.push([[""]]);
  rows.push([[pad("saved data", 16) + pad("size", 10, true) + pad("vars", 6, true) + "   largest", "#00ffff"]]);
  for (var i = 0; i < dl.length && i < 12; i++) {
    var o = d.pkgs[dl[i]];
    rows.push([[pad(dl[i], 16) + pad(kb(o.size), 10, true) + pad(o.n, 6, true) + "   " + o.big + " (" + kb(o.bigSize) + ")", o.size >= 512 * 1024 ? "#e6c25a" : "#9fc9c9"]]);
  }
  rows.push([[pad("all", 16) + pad(kb(d.total), 10, true), "#9fc9c9"]]);
};
