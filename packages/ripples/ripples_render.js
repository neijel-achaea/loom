// ripples_render -- the Ripples tab: five views of your wades in the
// Mnemosyne (Wade, Ripples, Boons, Affixes, Runs), in the house style of
// Coffers and Stats: ink panel, serif small-caps headings, monospace rows.
// The accent is the Mnemosyne's nacre teal. Wide tables scroll sideways, and
// keep their place through redraws.
if (!client.loom || !client.loom.ripples || !client.loom.ripples.line) run_function("ripples_setup", [], "ripples");
var R = client.loom.ripples;
var TH = (client.loom && client.loom.theme) || {};
var ACC = TH.acc || "#8fd0c4";
var DEEP = TH.deep || "#3f8f86";
var EDGE = "#3f6f6a";
var GOLD = "#e2bd5a";
var AIM = "#e0b45a";
var TXT = TH.txt || "#e2e8e4";
var MUTED = TH.muted || "#86918d";
var DIM = "#4f5a57";
var RULE = TH.rule || "#22302e";
var TRACK = TH.track || "#172120";
var BG = TH.bg || "#0d1213";
var UP = "#93cf8a";
var DOWN = "#de8a72";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
var RAR = { common: "#a9b4b0", uncommon: "#93cf8a", rare: "#7fb2d6", epic: "#c9a0dc", legendary: "#e2bd5a" };
var TYPES = { cutting: "#de8a72", blunt: "#7fb2d6", magical: "#c9a0dc", psychic: "#e0b45a", fire: "#f0883e", cold: "#5bc0de", poison: "#93cf8a", unblockable: "#d8d8d8", raw: "#8c8c8c", electricity: "#f2d43d", asphyxiation: "#7f8fa6" };

function esc(s) { return String(s === undefined || s === null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function caps(t, c) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (c || DEEP) + ';font-size:11px;margin:0 0 3px;">' + t + '</div>'; }
function row(l, v, c, tip) { return '<div style="display:flex;justify-content:space-between;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;"' + (tip ? ' title="' + esc(tip) + '"' : '') + '><span style="color:' + MUTED + ';white-space:nowrap;">' + l + '</span><span style="color:' + (c || TXT) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + v + '</span></div>'; }
function box(inner) { return '<div style="flex:1 1 140px;min-width:140px;border-top:2px solid ' + EDGE + ';padding:3px 2px 0;">' + inner + '</div>'; }
function section(t, inner, first) { return '<div style="' + (first ? '' : 'border-top:1px solid ' + RULE + ';') + 'margin-top:8px;padding-top:5px;">' + caps(t) + inner + '</div>'; }
function quiet(t) { return '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;margin-top:4px;">' + t + '</div>'; }
function note(t) { return '<div style="color:' + MUTED + ';margin-top:3px;">' + t + '</div>'; }
function bar(pct, col, h) { pct = Math.max(0, Math.min(100, pct)); return '<div style="background:' + TRACK + ';height:' + h + 'px;margin:2px 0;"><div style="background:' + col + ';height:' + h + 'px;width:' + Math.round(pct * 10) / 10 + '%;"></div></div>'; }
// A table that scrolls sideways when the tab is narrow; key keeps its place.
function scroller(key, inner) { return '<div data-rp-sx="' + key + '" onscroll="window.loomRipples&&window.loomRipples.keep(this)" style="overflow-x:auto;">' + inner + '</div>'; }
function th(t, left, tip) { return '<th style="padding:1px 4px;font-weight:normal;color:' + MUTED + ';text-align:' + (left ? 'left' : 'right') + ';white-space:nowrap;border-bottom:1px solid ' + RULE + ';"' + (tip ? ' title="' + esc(tip) + '"' : '') + '>' + t + '</th>'; }
function td(t, c, left, tip) { return '<td style="padding:1px 4px;text-align:' + (left ? 'left' : 'right') + ';white-space:nowrap;border-bottom:1px dotted ' + RULE + ';color:' + (c || TXT) + ';"' + (tip ? ' title="' + esc(tip) + '"' : '') + '>' + t + '</td>'; }
function table(head, rows) { return '<table style="border-collapse:collapse;width:100%;font-family:' + MONO + ';font-size:10px;">' + '<tr>' + head + '</tr>' + rows + '</table>'; }
function perH(v, secs) { return secs > 0 ? v / secs * 3600 : 0; }
function pct(a, b) { return b > 0 ? Math.round(a / b * 100) : 0; }
function survCol(p, n) { return n < 3 ? DIM : (p >= 80 ? UP : (p >= 50 ? AIM : DOWN)); }
function topTypes(c) {
  var tot = R.dmgTotal(c), out = [];
  for (var k in c.dmg) if (c.dmg.hasOwnProperty(k)) out.push([k, c.dmg[k]]);
  out.sort(function (a, b) { return b[1] - a[1]; });
  return { tot: tot, list: out };
}
function dmgBar(c) {
  var tt = topTypes(c);
  if (!tt.tot) return quiet("No damage taken yet.");
  var segs = "", leg = "", other = 0;
  for (var i = 0; i < tt.list.length; i++) {
    var p = tt.list[i][1] / tt.tot * 100;
    var col = TYPES[tt.list[i][0]] || "#5a6663";
    if (i < 4 && p >= 3) {
      segs += '<div style="width:' + Math.round(p * 10) / 10 + '%;background:' + col + ';"></div>';
      leg += '<span style="white-space:nowrap;"><span style="color:' + col + ';">&#9632;</span> ' + esc(tt.list[i][0]) + ' ' + Math.round(p) + '%</span>';
    } else other += p;
  }
  if (other > 0) { segs += '<div style="width:' + Math.round(other * 10) / 10 + '%;background:#5a6663;"></div>'; leg += '<span>other ' + Math.round(other) + '%</span>'; }
  return '<div style="display:flex;height:8px;background:' + TRACK + ';">' + segs + '</div><div style="display:flex;flex-wrap:wrap;gap:2px 12px;margin-top:3px;color:' + MUTED + ';">' + leg + '</div>';
}
function dps(v, bare) {
  var t = R.tone(v);
  return '<span style="color:' + (t ? t.colour : DOWN) + ';"' + (t ? ' title="' + esc(R.n(v) + "/s taken, " + t.word) + '"' : '') + '>' + R.n(v) + (bare ? '' : '/s') + '</span>';
}
function hpCol(p) { return p === null || p === undefined ? MUTED : (p < 25 ? DOWN : (p < 50 ? AIM : TXT)); }
function lowTxt(c) { return c && c.minHp !== null && c.minHp !== undefined ? '<span style="color:' + hpCol(c.minPct) + ';">' + R.n(c.minHp) + ' &middot; ' + c.minPct + '%</span>' : '<span style="color:' + MUTED + ';">&ndash;</span>'; }
function hearts(n) {
  if (n === null || n === undefined) return '<span style="color:' + DIM + ';" title="lives: WADE STATUS not read yet">&#9829; ?</span>';
  var s = "";
  for (var i = 0; i < Math.max(n, 3); i++) s += '<span style="color:' + (i < n ? DOWN : "#2a3634") + ';">&#9829;</span>';
  return '<span style="font-size:13px;letter-spacing:2px;" title="' + n + ' lives left">' + s + '</span>';
}

var AF = R.affixStats();
var html = '<div id="loom-ripples" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;">';
var glyph = '<svg width="18" height="16" viewBox="0 0 18 16" style="vertical-align:-3px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg"><path d="M1 9 Q5 5 9 9 T17 9" fill="none" stroke="' + ACC + '" stroke-width="1.3"/><path d="M3 13 Q6 10.5 9 13 T15 13" fill="none" stroke="' + EDGE + '" stroke-width="1.2"/><circle cx="9" cy="4" r="2" fill="#e8f1ee"/></svg>';
var right;
if (R.run) right = "wading &middot; " + R.dur(Date.now() - R.run.t0);
else if (R.ready) right = "ready to wade";
else if (R.runs.length) {
  var lastEnd = R.runs[R.runs.length - 1].t1, wait = lastEnd + 600000 - Date.now();
  right = wait > 0 ? "next wade in ~" + R.dur(wait) : "ready to wade";
} else right = "no wades yet";
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + EDGE + ';padding-bottom:3px;">';
html += '<div style="font-family:' + SERIF + ';color:' + ACC + ';font-size:14px;letter-spacing:0.22em;">' + glyph + 'MNEMOSYNE</div>';
html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + DEEP + ';font-size:11px;">' + right + '</div></div>';
var VW = [["wade", "Wade"], ["ripples", "Ripples"], ["boons", "Boons"], ["affixes", "Affixes"], ["runs", "Runs"]];
html += '<div style="display:flex;flex-wrap:wrap;gap:4px 14px;margin:5px 0 0;border-bottom:1px solid ' + RULE + ';">';
for (var vi = 0; vi < VW.length; vi++) {
  var on = R.view === VW[vi][0];
  html += '<span onclick="window.loomRipples&&window.loomRipples.view(\'' + VW[vi][0] + '\')" style="cursor:pointer;user-select:none;font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;font-size:12px;padding:0 1px 2px;color:' + (on ? ACC : MUTED) + ';border-bottom:2px solid ' + (on ? DEEP : "transparent") + ';margin-bottom:-1px;">' + VW[vi][1] + '</span>';
}
html += '</div>';

// ---- Wade: the run under way ------------------------------------------------------
if (R.view === "wade") {
  var run = R.run;
  if (!run) {
    html += quiet("Not wading. The view fills itself when you next WADE MNEMOSYNE; the other views keep your past runs.");
    var b0 = R.best();
    if (b0) html += section("Your best", row("deepest", "ripple " + b0.d) + row("in", R.dur(b0.t)) + row("ended", esc(b0.run.end || "?")));
  } else {
    var cur = R.cur();
    var last = run.ripples.length ? run.ripples[run.ripples.length - 1] : null;
    var shown = cur || last;
    html += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin:6px 0 0;"><div>';
    html += '<span style="font-family:' + SERIF + ';font-size:26px;color:' + ACC + ';">' + (shown ? "Ripple " + shown.n : "Entering") + '</span> ';
    html += '<span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">' + (shown ? esc(R.place(shown)) : "choose a boon") + (shown && !cur ? " &middot; cleared" : "") + '</span></div>' + hearts(run.lives) + '</div>';
    if (cur) {
      var bst = R.best();
      var pace = "";
      if (bst && bst.run !== run) {
        var mine = 0, theirs = 0, ok = true;
        for (var pi = 0; pi < run.ripples.length; pi++) {
          var bx = null;
          for (var pj = 0; pj < bst.run.ripples.length; pj++) if (bst.run.ripples[pj].n === run.ripples[pi].n) bx = bst.run.ripples[pj];
          if (!bx) { ok = false; break; }
          mine += R.secs(run.ripples[pi]); theirs += R.secs(bx);
        }
        if (ok) { var dd = Math.round(mine - theirs); pace = 'best pace <span style="color:' + (dd > 0 ? DOWN : UP) + ';">' + (dd > 0 ? "+" : "-") + R.dur(Math.abs(dd) * 1000) + '</span>'; }
      }
      html += '<div style="display:flex;justify-content:space-between;color:' + MUTED + ';gap:8px;"><span>objective: <span style="color:' + TXT + ';">' + (cur.obj ? esc(cur.obj) : "&hellip;") + '</span></span><span style="white-space:nowrap;">' + pace + '</span></div>';
      html += bar(cur.wave || 0, ACC, 6);
      var left = R.left(cur);
      html += '<div style="display:flex;justify-content:space-between;color:' + MUTED + ';"><span>' + (cur.wave !== null ? "wave " + cur.wave + "%" : "wave ?") + (left !== null ? ' &middot; <span style="color:' + TXT + ';" title="guessed from the wave\'s progress and your kills at the last WADE STATUS">~' + left + ' left</span>' : "") + (cur.reward ? " &middot; reward: " + esc(cur.reward) : "") + '</span><span>' + (cur.lastPoll ? "status " + Math.max(0, Math.round((Date.now() - cur.lastPoll) / 1000)) + "s ago" : (R.poll ? "" : "RIPPLES POLL is off")) + '</span></div>';
      if (cur.lvl !== null || cur.spd !== null) html += '<div style="color:' + MUTED + ';">denizens <span style="color:' + TXT + ';">+' + (cur.lvl || 0) + ' levels</span>, <span style="color:' + TXT + ';">+' + (cur.spd || 0) + ' speed</span></div>';
      if (cur.aff.length) {
        html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;">';
        for (var ai = 0; ai < cur.aff.length; ai++) {
          var an = cur.aff[ai], as = AF[an];
          var ap = as ? pct(as.ok, as.seen) : null;
          var tip = (R.codex.affixes[an] || "") + (as ? " — seen " + as.seen + ", survived " + as.ok : " — first time");
          html += '<span title="' + esc(tip) + '" style="border:1px solid ' + (as && as.seen >= 3 && ap < 50 ? "#8a4a3a" : EDGE) + ';padding:1px 5px;white-space:nowrap;">' + esc(an) + ' <span style="color:' + (as ? survCol(ap, as.seen) : ACC) + ';">' + (as ? ap + "%" : "new") + '</span></span>';
        }
        html += '</div>';
      }
    } else if (run.screens.length && !run.screens[run.screens.length - 1].took) {
      html += quiet("Between ripples: choose a boon (Boons shows what each did for you before).");
    }
    var sec = shown ? R.secs(shown) : 0;
    var rb = shown ? row("time", R.dur(sec * 1000)) + row("kills", shown.kills) + row("xp/h", R.n(perH(shown.xp, sec)), GOLD) + row("gold/h", R.n(perH(shown.gold, sec)), GOLD) + row("taken", dps(R.dmgTotal(shown) / sec)) : quiet("&hellip;");
    var rt = { kills: 0, xp: 0, gold: 0, lost: 0, flees: 0, low: null };
    for (var ri = 0; ri < run.ripples.length; ri++) {
      var rr = run.ripples[ri]; rt.kills += rr.kills; rt.xp += rr.xp; rt.gold += rr.gold; rt.lost += rr.lost || 0; rt.flees += R.fleesIn(rr);
      if (rr.minHp !== null && rr.minHp !== undefined && (!rt.low || rr.minHp < rt.low.minHp)) rt.low = rr;
    }
    var rs = (Date.now() - run.t0) / 1000;
    var rbx = row("kills", rt.kills) + row("xp", R.n(rt.xp), GOLD) + row("xp/h", R.n(perH(rt.xp, rs)), GOLD) + row("renown", run.renown ? R.n(run.renown) : "0") + row("rerolls", run.rerolls === null ? "?" : run.rerolls);
    html += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;">' + box(caps(cur ? "This ripple" : "Last ripple") + rb) + box(caps("This run") + rbx) + '</div>';
    if (shown) html += section("Incoming damage &middot; " + (cur ? "this" : "last") + " ripple", dmgBar(shown));
    // Boons claimed, beside the close calls.
    // The last five claimed, newest last; the rest folded into one line.
    var held = "", claimedAll = [];
    for (var sj = 0; sj < run.screens.length; sj++) if (run.screens[sj].took) claimedAll.push(run.screens[sj]);
    var earlier = claimedAll.slice(0, Math.max(0, claimedAll.length - 5));
    if (earlier.length) held += row('<span style="color:' + MUTED + ';">+' + earlier.length + ' earlier</span>', "", MUTED, earlier.map(function (x) { return x.took; }).join(", "));
    var shownClaims = claimedAll.slice(-5);
    for (var si = 0; si < shownClaims.length; si++) {
      var sc = shownClaims[si];
      var bd = R.codex.boons[sc.took];
      var ech = run.echo && run.echo[sc.took] > 1 ? ' <span style="color:' + MUTED + ';">&times;' + run.echo[sc.took] + '</span>' : '';
      held += row('<span style="color:' + ((bd && RAR[bd.r]) || TXT) + ';">' + esc(sc.took === "?" ? "? (" + sc.opts.length + " offered)" : sc.took) + '</span>' + ech, sc.after ? "R" + sc.after : "in", MUTED, bd && bd.d ? bd.d : (sc.took === "?" ? "offered: " + sc.opts.join(", ") : ""));
    }
    var fl = R.hasFlees();
    var close = row("lowest here", lowTxt(shown), TXT, "the lowest health in " + (cur ? "this" : "the last") + " ripple") +
      row("lowest in run", rt.low ? lowTxt(rt.low) + ' <span style="color:' + MUTED + ';">R' + rt.low.n + '</span>' : lowTxt(null), TXT) +
      row("flees", fl ? (shown ? R.fleesIn(shown) : 0) + ' <span style="color:' + MUTED + ';">/ ' + rt.flees + ' run</span>' : '<span style="color:' + DIM + ';">no basher</span>', TXT, fl ? "the basher's flees, this ripple / this run" : "counted when the basher (and loom) are installed") +
      row("lives lost", (shown ? shown.lost || 0 : 0) + ' <span style="color:' + MUTED + ';">/ ' + rt.lost + ' run</span>', rt.lost ? DOWN : TXT);
    html += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;">' + box(caps("Boons claimed") + (held || quiet("None yet."))) + box(caps("Close calls") + close) + '</div>';
    // Splits against the best run
    var best = R.best();
    if (run.ripples.length) {
      var cells = "", maxS = 1;
      for (var mi = 0; mi < run.ripples.length; mi++) maxS = Math.max(maxS, R.secs(run.ripples[mi]));
      for (var ci = 0; ci < run.ripples.length; ci++) {
        var rp = run.ripples[ci], s1 = R.secs(rp), hb = Math.max(3, Math.round(s1 / maxS * 18));
        var bm = null;
        if (best && best.run !== run) for (var bj = 0; bj < best.run.ripples.length; bj++) if (best.run.ripples[bj].n === rp.n) bm = best.run.ripples[bj];
        var dlt = bm && rp.t1 ? Math.round(s1 - R.secs(bm)) : null;
        var colr = !rp.t1 ? ACC : (rp.lost ? DOWN : "#2c4a46");
        cells += '<div style="flex:1 1 0;min-width:30px;text-align:center;" title="' + esc(R.place(rp)) + '"><div style="height:18px;display:flex;align-items:flex-end;"><div style="width:100%;height:' + hb + 'px;background:' + colr + ';"></div></div>' + R.dur(s1 * 1000) + '<br><span style="color:' + (dlt === null ? MUTED : (dlt > 0 ? DOWN : UP)) + ';">' + (!rp.t1 ? "live" : (dlt === null ? "R" + rp.n : (dlt > 0 ? "+" : "-") + R.dur(Math.abs(dlt) * 1000))) + '</span></div>';
      }
      html += section("Splits &middot; this run" + (best && best.run !== run ? " vs your best" : ""), '<div style="display:flex;gap:3px;">' + cells + '</div>' + note("one bar per ripple; orange: a life lost there"));
    }
  }
}

// ---- Ripples: the last run, places, depths -----------------------------------------
if (R.view === "ripples") {
  var lr = R.run && R.run.ripples.length ? R.run : (R.runs.length ? R.runs[R.runs.length - 1] : null);
  if (!lr) html += quiet("No ripples yet.");
  else {
    var rows = "";
    for (var li = 0; li < lr.ripples.length; li++) {
      var c = lr.ripples[li], s2 = R.secs(c), tt = topTypes(c);
      var top = tt.list.length ? tt.list[0][0] + " " + pct(tt.list[0][1], tt.tot) + "%" : "-";
      rows += '<tr>' + td(c.n, (c.lost ? DOWN : TXT)) + td(esc(R.place(c)) + (c.reroll ? " &#9733;" : ""), TXT, true, c.intro) + td(R.dur(s2 * 1000)) + td(c.kills) + td(R.k(perH(c.xp, s2)), GOLD) + td(R.k(perH(c.gold, s2))) + td(dps(tt.tot / s2, true)) + td(c.minPct === null || c.minPct === undefined ? "-" : c.minPct + "%", hpCol(c.minPct), false, c.minHp !== null && c.minHp !== undefined ? "lowest health " + R.n(c.minHp) : "") + td(R.fleesIn(c) || "-", R.fleesIn(c) ? AIM : MUTED) + td(esc(top), MUTED, true) + td(c.lvl === null ? "-" : "+" + c.lvl, MUTED) + td(esc((c.aff || []).join(", ") || "-"), MUTED, true) + '</tr>';
    }
    html += section((lr === R.run ? "This run" : "Last run") + ", ripple by ripple", scroller("last", table(th("#") + th("place", true) + th("time") + th("kills") + th("xp/h") + th("gold/h") + th("in/s", false, "damage taken per second, coloured as the Stats tab colours it") + th("low", false, "lowest health in the ripple") + th("fled", false, "the basher's flees") + th("top dmg", true) + th("lvl", false, "denizen levels added") + th("affixes", true), rows)) + note("&#9733; boss ripple (it gave a reroll) &middot; hover a place for the game's line"), true);
  }
  // Places, every run
  var PL = {}, allR = R.ripplesAll(true);
  for (var ai2 = 0; ai2 < allR.length; ai2++) {
    var cr = allR[ai2], key = R.place(cr), p = PL[key] || (PL[key] = { seen: 0, ok: 0, done: 0, xp: 0, s: 0, lo: 99, hi: 0 });
    p.seen++; if (cr.t1) { p.done++; if (!cr.lost) p.ok++; } p.xp += cr.xp; p.s += R.secs(cr); if (cr.n < p.lo) p.lo = cr.n; if (cr.n > p.hi) p.hi = cr.n;
  }
  var pk = Object.keys(PL).sort(function (a, b) { return PL[b].seen - PL[a].seen; });
  var pr = "";
  for (var pq = 0; pq < pk.length; pq++) {
    var pp = PL[pk[pq]], sp2 = pp.done ? pct(pp.ok, pp.done) : null;
    pr += '<tr>' + td('<span onclick="window.loomRipples&&window.loomRipples.rename(\'' + esc(pk[pq]).replace(/'/g, "\\'") + '\')" style="cursor:pointer;border-bottom:1px dotted ' + EDGE + ';">' + esc(pk[pq]) + '</span>', TXT, true, "click to rename") + td(pp.lo === pp.hi ? pp.lo : pp.lo + "&ndash;" + pp.hi, MUTED) + td(pp.seen) + td(sp2 === null ? "-" : sp2 + "%", sp2 === null ? MUTED : survCol(sp2, pp.done)) + td(R.k(perH(pp.xp, pp.s)), GOLD) + '</tr>';
  }
  if (pr) html += section("Places &middot; every run", scroller("places", table(th("place", true) + th("depths") + th("seen") + th("survived", false, "ripples finished without losing a life") + th("xp/h"), pr)) + note("Click a place to rename it, for every ripple there from now on (or RIPPLES NAME &lt;place&gt; = &lt;name&gt;)."));
  // By depth: median minutes and damage per second
  var DP = {};
  for (var dq = 0; dq < allR.length; dq++) {
    var cd = allR[dq];
    if (!cd.t1) continue;
    var dd2 = DP[cd.n] || (DP[cd.n] = { m: [], d: [] });
    dd2.m.push(R.secs(cd) / 60); dd2.d.push(R.dmgTotal(cd) / R.secs(cd));
  }
  var dk = Object.keys(DP).map(Number).sort(function (a, b) { return a - b; });
  if (dk.length) {
    var Wd = 380, Hd = 92, x0 = 26, y0 = 12, y1 = 76, mMax = 1, dMax = 1;
    for (var dz = 0; dz < dk.length; dz++) { mMax = Math.max(mMax, R.median(DP[dk[dz]].m)); dMax = Math.max(dMax, R.median(DP[dk[dz]].d)); }
    var bw = (Wd - x0 - 4) / dk.length, svg = '<svg viewBox="0 0 ' + Wd + ' ' + Hd + '" width="100%" style="display:block;height:auto;" xmlns="http://www.w3.org/2000/svg">';
    svg += '<line x1="' + x0 + '" y1="' + y1 + '" x2="' + Wd + '" y2="' + y1 + '" stroke="' + EDGE + '" stroke-width="0.8"/><line x1="' + x0 + '" y1="' + y0 + '" x2="' + Wd + '" y2="' + y0 + '" stroke="' + RULE + '" stroke-width="0.6"/>';
    svg += '<text x="' + (x0 - 3) + '" y="' + (y0 + 3) + '" text-anchor="end" font-family="' + MONO + '" font-size="8" fill="' + MUTED + '">' + Math.ceil(mMax) + 'm</text>';
    var path = "";
    for (var dx = 0; dx < dk.length; dx++) {
      var md = R.median(DP[dk[dx]].m), mdps = R.median(DP[dk[dx]].d);
      var bh = md / mMax * (y1 - y0), bx2 = x0 + dx * bw + bw * 0.18;
      svg += '<rect x="' + Math.round(bx2) + '" y="' + Math.round(y1 - bh) + '" width="' + Math.round(bw * 0.64) + '" height="' + Math.round(bh) + '" fill="#2c4a46"><title>ripple ' + dk[dx] + ': ' + Math.round(md * 10) / 10 + ' min, ' + Math.round(mdps) + '/s taken (' + DP[dk[dx]].m.length + ' seen)</title></rect>';
      path += (dx ? "L" : "M") + Math.round(x0 + dx * bw + bw / 2) + "," + Math.round(y1 - mdps / dMax * (y1 - y0));
      svg += '<text x="' + Math.round(x0 + dx * bw + bw / 2) + '" y="' + (Hd - 3) + '" text-anchor="middle" font-family="' + MONO + '" font-size="8" fill="' + MUTED + '">' + dk[dx] + '</text>';
    }
    svg += '<path d="' + path + '" fill="none" stroke="' + DOWN + '" stroke-width="1.4"/></svg>';
    html += section("By depth &middot; every run", svg + note('<span style="color:#2c4a46;">&#9632;</span> median minutes &middot; <span style="color:' + DOWN + ';">&#9632;</span> damage taken/s (median ' + R.n(dMax) + '/s at most)'));
  }
}

// ---- Boons ---------------------------------------------------------------------------
if (R.view === "boons") {
  var BS = R.boonStats();
  var live = R.run && R.run.screens.length ? R.run.screens[R.run.screens.length - 1] : null;
  if (live && !live.took && live.opts.length) {
    var off = "";
    for (var oi = 0; oi < live.opts.length; oi++) {
      var on2 = live.opts[oi], ob = BS[on2];
      if (on2 === "Restoration") continue;
      var hist = (!ob || ob.offered <= 1) ? '<span style="color:' + ACC + ';">new &middot; never offered</span>' : 'taken ' + ob.taken + ' of ' + (ob.offered - 1) + (ob.reach !== null ? ' &middot; runs reach <span style="color:' + TXT + ';">R' + ob.reach + '</span>' : '');
      off += '<div title="' + esc((R.codex.boons[on2] || {}).d || "") + '" style="display:flex;justify-content:space-between;gap:8px;border-bottom:1px dotted ' + RULE + ';padding:2px 0;"><span>' + esc(on2) + (R.run.held.indexOf(on2) >= 0 ? ' <span style="color:' + MUTED + ';">(held)</span>' : '') + '</span><span style="color:' + MUTED + ';white-space:nowrap;">' + hist + '</span></div>';
    }
    html += '<div style="border:1px solid ' + EDGE + ';background:#111b1b;margin-top:7px;padding:5px 6px;">' + caps("On offer now", ACC) + off + '</div>';
  }
  var names = Object.keys(BS).filter(function (n) { return n !== "Restoration"; });
  var S = R.sort;
  names.sort(function (a, b) {
    if (S === "az") return a < b ? -1 : 1;
    if (S === "offered") return BS[b].offered - BS[a].offered || BS[b].taken - BS[a].taken;
    if (S === "reach") return (BS[b].reach || 0) - (BS[a].reach || 0) || BS[b].taken - BS[a].taken;
    return BS[b].taken - BS[a].taken || BS[b].offered - BS[a].offered;
  });
  var SO = [["taken", "taken"], ["offered", "offered"], ["reach", "depth"], ["az", "a&ndash;z"]];
  var sl = '<div style="display:flex;gap:12px;margin-top:7px;font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;font-size:11px;color:' + MUTED + ';"><span>sort:</span>';
  for (var so = 0; so < SO.length; so++) sl += '<span onclick="window.loomRipples&&window.loomRipples.sort(\'' + SO[so][0] + '\')" style="cursor:pointer;user-select:none;color:' + (S === SO[so][0] ? ACC : MUTED) + ';">' + SO[so][1] + '</span>';
  html += sl + '</div>';
  if (!names.length) html += quiet("No boons offered yet: they're noted from each boon screen you see.");
  else {
    var br = "";
    for (var bi = 0; bi < names.length; bi++) {
      var bn = names[bi], b = BS[bn], cdx = R.codex.boons[bn] || {};
      br += '<tr>' + td(esc(bn), b.taken ? TXT : MUTED, true, cdx.d) + td(cdx.r ? esc(cdx.r) : "", RAR[cdx.r] || MUTED, true) + td(b.offered) + td(b.taken) + td(b.offered - b.taken, MUTED) + td(b.reach === null ? "&ndash;" : b.reach, b.depths.length < 3 ? DIM : TXT, false, b.depths.length + " finished runs held it") + '</tr>';
    }
    html += section("Every boon offered", scroller("boons", table(th("boon", true) + th("rarity", true, "from BOON CLAIMED, once you've held it") + th("offered") + th("taken") + th("passed") + th("reach", false, "median depth of finished runs that held it"), br)) + note("reach is greyed under 3 runs. It shows how far runs went, not what the boon did: early picks ride along in every run."), true);
    var takenOnce = 0;
    for (var tq = 0; tq < names.length; tq++) if (BS[names[tq]].taken) takenOnce++;
    html += section("Codex", '<div style="display:flex;justify-content:space-between;color:' + MUTED + ';"><span>met <span style="color:' + TXT + ';">' + names.length + '</span> &middot; taken at least once <span style="color:' + TXT + ';">' + takenOnce + '</span></span></div>' + bar(pct(takenOnce, names.length), ACC, 6));
  }
}

// ---- Affixes -------------------------------------------------------------------------
if (R.view === "affixes") {
  var an2 = Object.keys(AF);
  for (var ak in R.codex.affixes) if (R.codex.affixes.hasOwnProperty(ak) && an2.indexOf(ak) < 0) an2.push(ak);
  an2.sort(function (a, b) { var A = AF[a], B = AF[b]; if (!A || !B) return A ? -1 : (B ? 1 : 0); var a3 = A.seen >= 3, b3 = B.seen >= 3; if (a3 !== b3) return a3 ? -1 : 1; return A.vs - B.vs; });
  if (!an2.length) html += quiet("No affixes yet. They show from ripple 5, and are read from WADE STATUS (RIPPLES POLL asks it for you).");
  else {
    var ar = "";
    for (var aj = 0; aj < an2.length; aj++) {
      var nm = an2[aj], a = AF[nm], few = !a || a.seen < 3;
      var vs = a ? (a.vs > 0 ? "&#9650; " + a.vs : (a.vs < 0 ? "&#9660; " + (-a.vs) : "0")) : "&ndash;";
      ar += '<tr>' + td(esc(nm), few ? MUTED : TXT, true, R.codex.affixes[nm]) + td(a ? a.seen : 0) + td(a ? "R" + a.first : "&ndash;", MUTED) + td(a ? a.ok + "/" + a.seen : "&ndash;") + td(few ? "too few" : vs, few ? DIM : (a.vs <= -10 ? DOWN : (a.vs >= 10 ? UP : MUTED))) + td(few ? "&ndash;" : (a.dpsPct > 0 ? "+" : "") + a.dpsPct + "%", few ? DIM : (a.dpsPct >= 10 ? DOWN : (a.dpsPct <= -10 ? UP : TXT))) + '</tr>';
    }
    html += section("Affixes, against the depth they came at", scroller("affixes", table(th("affix", true) + th("seen") + th("from") + th("survived") + th("vs depth", false, "points of survival above or below other ripples at the same depths") + th("in/s", false, "damage taken per second against other ripples at the same depths"), ar)) + note("vs depth compares with every ripple at the same depths, so a deep affix isn't blamed for the depth. Greyed under 3 sightings; hover a name for what it does."), true);
  }
}

// ---- Runs ----------------------------------------------------------------------------
if (R.view === "runs") {
  var B = R.best();
  if (!R.runs.length) html += quiet("No finished runs yet." + (R.run ? " One is under way." : ""));
  else {
    html += '<div style="margin:6px 0 1px;"><span style="font-family:' + SERIF + ';font-size:26px;color:' + ACC + ';">Ripple ' + B.d + '</span> <span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">your deepest, ' + new Date(B.run.t0).toLocaleDateString(undefined, { day: "numeric", month: "short" }) + '</span></div>';
    var depths = [], tw = 0, lost = 0, xp = 0, ren = 0;
    for (var rq = 0; rq < R.runs.length; rq++) {
      var ru = R.runs[rq];
      depths.push(R.depthOf(ru)); tw += ru.t1 - ru.t0; ren += ru.renown || 0;
      for (var rz = 0; rz < ru.ripples.length; rz++) { lost += ru.ripples[rz].lost || 0; xp += ru.ripples[rz].xp; }
    }
    html += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:7px;">' + box(caps("All runs") + row("runs", R.runs.length) + row("median depth", R.median(depths)) + row("time wading", R.dur(tw)) + row("lives lost", lost, lost ? DOWN : TXT)) + box(caps("Rewards") + row("renown", R.n(ren)) + row("renown/h", R.n(perH(ren, tw / 1000))) + row("xp/h", R.n(perH(xp, tw / 1000)), GOLD) + row("threads", "not read yet", MUTED)) + '</div>';
    // How far runs get: share reaching each depth
    var maxD = 0;
    for (var md2 = 0; md2 < depths.length; md2++) if (depths[md2] > maxD) maxD = depths[md2];
    if (maxD > 0) {
      var Wc = 380, Hc = 84, cx0 = 28, cy0 = 12, cy1 = 70, step = (Wc - cx0 - 4) / maxD, pth = "", wall = { n: 0, at: 0 };
      for (var dn = 1; dn <= maxD; dn++) {
        var reach = 0, endHere = 0;
        for (var dr = 0; dr < depths.length; dr++) { if (depths[dr] >= dn) reach++; if (depths[dr] === dn) endHere++; }
        var yy = cy1 - reach / depths.length * (cy1 - cy0);
        pth += (dn === 1 ? "M" + cx0 + "," + Math.round(yy) : "V" + Math.round(yy)) + "H" + Math.round(cx0 + dn * step);
        if (endHere > wall.n && dn < maxD) wall = { n: endHere, at: dn };
      }
      var sv = '<svg viewBox="0 0 ' + Wc + ' ' + Hc + '" width="100%" style="display:block;height:auto;" xmlns="http://www.w3.org/2000/svg">';
      sv += '<line x1="' + cx0 + '" y1="' + cy1 + '" x2="' + Wc + '" y2="' + cy1 + '" stroke="' + EDGE + '" stroke-width="0.8"/><line x1="' + cx0 + '" y1="' + cy0 + '" x2="' + Wc + '" y2="' + cy0 + '" stroke="' + RULE + '" stroke-width="0.6"/>';
      sv += '<text x="' + (cx0 - 3) + '" y="' + (cy0 + 3) + '" text-anchor="end" font-family="' + MONO + '" font-size="8" fill="' + MUTED + '">100%</text><text x="' + (cx0 - 3) + '" y="' + (cy1 + 2) + '" text-anchor="end" font-family="' + MONO + '" font-size="8" fill="' + MUTED + '">0</text>';
      sv += '<path d="' + pth + 'V' + cy1 + 'H' + cx0 + 'Z" fill="' + ACC + '" fill-opacity="0.12"/><path d="' + pth + '" fill="none" stroke="' + ACC + '" stroke-width="1.5"/>';
      for (var dl = 1; dl <= maxD; dl++) sv += '<text x="' + Math.round(cx0 + (dl - 0.5) * step) + '" y="' + (Hc - 3) + '" text-anchor="middle" font-family="' + MONO + '" font-size="8" fill="' + MUTED + '">' + dl + '</text>';
      sv += '</svg>';
      html += section("How far runs get", sv + (wall.n > 1 ? note("the wall: " + wall.n + " of " + depths.length + " runs ended at ripple " + wall.at) : ""));
    }
    var rl = "";
    for (var rk = R.runs.length - 1; rk >= 0 && rk >= R.runs.length - 15; rk--) {
      var rn = R.runs[rk], lastRip = rn.ripples.length ? rn.ripples[rn.ripples.length - 1] : null;
      var why = rn.end === "died" ? "died" + (rn.killer ? " &middot; " + esc(rn.killer) : "") : (rn.end === "left" ? "left" + (lastRip ? " &middot; " + esc(R.place(lastRip)) : "") : "?");
      rl += '<tr>' + td(new Date(rn.t0).toLocaleDateString(undefined, { day: "numeric", month: "short" }), MUTED, true) + td(R.depthOf(rn), rn === B.run ? ACC : TXT) + td(R.dur(rn.t1 - rn.t0)) + td(rn.lives === null || rn.lives === undefined ? "?" : rn.lives) + td(R.n(rn.renown || 0)) + td(why, rn.end === "died" ? DOWN : MUTED, true) + '</tr>';
    }
    html += section("Runs", scroller("runs", table(th("date", true) + th("depth") + th("time") + th("lives") + th("renown") + th("ended", true), rl)));
  }
}

html += '</div>';
try {
  var rpSt = document.getElementById("loom-ripples-style");
  if (!rpSt) { rpSt = document.createElement("style"); rpSt.id = "loom-ripples-style"; document.head.appendChild(rpSt); }
  var rpCss = '.flexlayout__tab:has(#loom-ripples) { background: ' + BG + ' !important; } .flexlayout__tab:has(#loom-ripples) > * { min-height: 100%; }';
  if (rpSt.textContent !== rpCss) rpSt.textContent = rpCss;
} catch (e) {}
try { set_custom_tab_html(R.tab, html); } catch (e) {}
R.restoreScroll();
setTimeout(R.restoreScroll, 20);
