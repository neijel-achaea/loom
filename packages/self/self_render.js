// Draws the 'Self' tab in the house style shared with Coffers, Level and the
// rest: ink panel, serif small-caps headings, one large figure, monospace
// ledger rows. The large figure is the affliction count, since that is the
// thing to see first; the accent is a muted rose.
run_function("self_init", [], "self");
var S = client.self;
var WANT = client.selfWant;
var KEEP = client.selfKeep;
var WARN = "#e6c25a";
var ROSE = "#e0a0a8";
var DEEP = "#7a4a52";
var TXT = "#ebe2e3";
var MUTED = "#8f8587";
var RULE = "#30262a";
var AFF = "#e07a6e";
var OK = "#8fd0a0";
var CYAN = "#7fc8d8";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
var LOST_SECS = 120;
var now = Math.floor(new Date().getTime() / 1000);

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function caps(t, c) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (c || ROSE) + ';font-size:11px;margin:0 0 3px;">' + t + '</div>'; }
function section(title, inner) { return '<div style="border-top:1px solid ' + RULE + ';margin-top:8px;padding-top:5px;">' + caps(title) + inner + '</div>'; }
function quiet(t) { return '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">' + t + '</div>'; }
function chip(t, fg, border, bg, tip, extra) {
  return '<span title="' + esc(tip || "") + '" style="display:inline-block;margin:0 4px 3px 0;padding:0 5px;border:1px solid ' + border + ';color:' + fg + ';' + (bg ? 'background:' + bg + ';' : '') + 'white-space:nowrap;' + (extra || '') + '">' + esc(t) + '</span>';
}
function keys(o) { var a = []; for (var k in o) { if (o.hasOwnProperty(k)) { a.push(k); } } a.sort(); return a; }

// A simple bust, the Self tab's counterpart of the coin stack.
var glyph = '<svg width="16" height="16" viewBox="0 0 16 16" style="vertical-align:-3px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="8" cy="5" r="3.3" fill="' + ROSE + '"/><path d="M1.5 15.5 C2 10.5 5 9.2 8 9.2 C11 9.2 14 10.5 14.5 15.5 Z" fill="' + DEEP + '" stroke="' + ROSE + '" stroke-width="0.8"/></svg>';

var I = S.info || {};
var html = '<div style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#141012;border:1px solid ' + RULE + ';padding:7px 8px 8px;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
// The title is the character's name: my_name barely ever changes.
var myName = "";
try { myName = String(get_variable("my_name") || ""); } catch (e) { myName = ""; }
if (!myName || myName === "undefined") { myName = I.name || "Self"; }
html += '<div style="font-family:' + SERIF + ';color:' + ROSE + ';font-size:14px;letter-spacing:0.22em;">' + glyph + esc(myName.toUpperCase()) + '</div>';
var right = [];
if (I.race) { right.push(esc(I.race)); }
// In dragonform race and class are both e.g. "Black Dragon": show it once.
if (I["class"] && String(I["class"]).toLowerCase() !== String(I.race || "").toLowerCase()) { right.push(esc(I["class"])); }
if (I.level) { right.push("level " + esc(String(I.level).split(" ")[0])); }
html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + MUTED + ';font-size:11px;">' + right.join(' &middot; ') + '</div></div>';


// Compact columns: each column is only as wide as its rows, a label and a
// right-aligned value with a modest gap; the columns spread across the width
// so the last one sits against the right margin.
// The third argument is a colour, or true for the warning colour.
function cell(label, value, warn, extra) {
  var vc = value ? (typeof warn === "string" ? warn : (warn ? WARN : TXT)) : MUTED;
  return '<span style="color:' + MUTED + ';white-space:nowrap;border-bottom:1px dotted ' + RULE + ';padding:1px 0;">' + label + '</span>' +
    '<span style="color:' + vc + ';text-align:right;border-bottom:1px dotted ' + RULE + ';padding:1px 0;">' + (value ? esc(value) + (extra || '') : '&mdash;') + '</span>';
}
function column(cells) { return '<div style="display:grid;grid-template-columns:auto auto;column-gap:10px;align-content:start;min-width:0;">' + cells + '</div>'; }
function columns(cols) {
  // No wrapping: on a narrow tab the long readings wrap within their cell instead.
  var out = '<div style="display:flex;justify-content:space-between;column-gap:16px;">';
  for (var i = 0; i < cols.length; i++) { if (cols[i]) { out += column(cols[i]); } }
  return out + '</div>';
}

// Character: ranks on the left, organisations in the middle, the longer
// SCORE readings on the right. Age and XP rank are live from Char.Status;
// the rest only as fresh as the last SCORE.
var C = S.score || {};
// Readings by exact wording: the best in green, the worst in red, a few in
// between in yellow, anything unlisted in plain white. Add phrases as they turn up.
var READ = {
  rest: { green: ["fully rested"], yellow: [], red: ["badly in need of sleep"] },
  hunger: { green: ["utterly satiated"], yellow: [], red: ["weak from hunger"] }
};
function readCol(kind, v) {
  var t = READ[kind], k = String(v || "").toLowerCase();
  if (!k) { return ""; }
  if (t.green.indexOf(k) >= 0) { return OK; }
  if (t.red.indexOf(k) >= 0) { return AFF; }
  if (t.yellow.indexOf(k) >= 0) { return WARN; }
  return TXT;
}
// XP rank change since this page load: lower is better, so a drop is green.
var xpNow = parseInt(I.xprank || C.xprank || "", 10);
if (!isNaN(xpNow) && S.xpBase === undefined) { S.xpBase = xpNow; }
var xpTxt = isNaN(xpNow) ? "" : String(xpNow);
var xpHtml = "";
if (!isNaN(xpNow) && S.xpBase !== undefined && xpNow !== S.xpBase) {
  var xd = xpNow - S.xpBase;
  xpHtml = ' <span style="color:' + (xd < 0 ? OK : AFF) + ';">(' + (xd > 0 ? "+" : "") + xd + ')</span>';
}
var chA = cell("age", I.age || C.age || "") + cell("xp rank", xpTxt, false, xpHtml) + cell("explorer", C.explorer || "");
var chB = cell("city rank", C.cityRank || "") +
  cell("house rank", C.houseRank || "") +
  cell("soldier", C.soldier ? C.soldier.toLowerCase() : "");
var chC = cell("rest", C.rest || "", readCol("rest", C.rest)) +
  cell("hunger", C.hunger || "", readCol("hunger", C.hunger)) +
  cell("sobriety", C.sobriety || "", C.sobriety && !/completely sober/i.test(C.sobriety));
var ch = columns([chA, chB, chC]);
if (C.t) {
  var ago = Math.floor((now - C.t) / 60);
  ch += '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;margin-top:2px;">from SCORE, ' + (ago < 1 ? 'just now' : ago < 60 ? ago + 'm ago' : Math.floor(ago / 60) + 'h ago') + '</div>';
} else {
  ch += '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;margin-top:2px;">SCORE fills in ranks, rest, hunger and sobriety.</div>';
}
html += section("Character", ch);

// Condition, from Char.Vitals: general stats on the left, the elemental
// resistances together on the right.
if (S.stats && S.stats.length) {
  var gen = "", res = "";
  for (var s = 0; s < S.stats.length; s++) {
    var part = String(S.stats[s]);
    var ci = part.indexOf(":");
    var lab = ci >= 0 ? part.slice(0, ci) : part;
    var val = ci >= 0 ? part.slice(ci + 1).replace(/^\s+|\s+$/g, "") : "";
    var dim = (val === "" || val === "0" || val.toLowerCase() === "none");
    // Thresholds: bleeding from 50 is red; rage 14-35 yellow, 36+ green.
    var num = parseInt(val, 10);
    var vcol = dim ? MUTED : TXT;
    if (/^bleed$/i.test(lab) && num >= 50) { vcol = AFF; }
    if (/^rage$/i.test(lab) && num >= 36) { vcol = OK; } else if (/^rage$/i.test(lab) && num >= 14) { vcol = WARN; }
    var c2 = '<span style="color:' + MUTED + ';white-space:nowrap;border-bottom:1px dotted ' + RULE + ';padding:1px 0;">' + esc(lab) + '</span>' +
      '<span style="color:' + vcol + ';text-align:right;white-space:nowrap;border-bottom:1px dotted ' + RULE + ';padding:1px 0;">' + esc(val || "none") + '</span>';
    if (/^r(air|earth|fire|water)$/i.test(lab)) { res += c2; } else { gen += c2; }
  }
  html += section("Condition", columns([gen, res]));
}

// Afflictions: only the unwanted ones, as red chips. Ones kept on purpose
// (deafness, blindness, insomnia) are left out, since they show among the
// defences anyway. The row is always there, one chip high even when empty,
// so a new affliction lands in place without pushing the tab down.
var affs = keys(S.affs);
var af = '<div style="min-height:18px;">';
// An unknown venom: a yellow "diag" chip at the head of the row until DIAG runs.
if (S.needDiag) { af += chip("diag", "#1a1608", WARN, WARN, "A venom's effects are unknown: run DIAG", "font-weight:bold;"); }
for (var a = 0; a < affs.length; a++) {
  if (!KEEP[affs[a].replace(/\s*\(\d+\)$/, "")]) { af += chip(affs[a], "#1a1012", AFF, AFF, S.affs[affs[a]].desc, "font-weight:bold;"); }
}
af += '</div>';
html += section("Afflictions", af);

// Defences: watched-but-missing first, then what is up, then what fell
// recently, so a stripped defence is noticed rather than just absent.
var defs = keys(S.defs);
var missing = [];
for (var w in WANT) { if (WANT.hasOwnProperty(w) && !S.defs[w]) { missing.push(w); } }
missing.sort();
var lost = [];
for (var l in S.lost) { if (S.lost.hasOwnProperty(l)) { if (now - S.lost[l] <= LOST_SECS && !S.defs[l] && !WANT[l]) { lost.push(l); } else if (now - S.lost[l] > LOST_SECS) { delete S.lost[l]; } } }
lost.sort();
var db = "";
if (missing.length) {
  db += '<div style="margin-bottom:3px;"><span style="color:' + AFF + ';margin-right:6px;">missing</span>';
  for (var m = 0; m < missing.length; m++) { db += chip(missing[m], AFF, AFF, "", "watched, not up"); }
  db += '</div>';
}
if (defs.length) {
  db += '<div>';
  for (var d = 0; d < defs.length; d++) {
    var wanted = !!WANT[defs[d]];
    db += chip(defs[d], wanted ? "#101a12" : CYAN, wanted ? OK : "#3d6b75", wanted ? OK : "", S.defs[defs[d]].desc);
  }
  db += '</div>';
} else {
  db += quiet(S.seenDefs ? "No defences up." : "No defences reported yet. Type DEF to fill this in.");
}
if (lost.length) {
  db += '<div style="margin-top:3px;"><span style="color:' + MUTED + ';margin-right:6px;">just lost</span>';
  for (var lo = 0; lo < lost.length; lo++) { db += chip(lost[lo], MUTED, RULE, "", "lost " + (now - S.lost[lost[lo]]) + "s ago", "text-decoration:line-through;"); }
  db += '</div>';
}
html += section("Defences" + (defs.length ? ' <span style="font-variant:normal;letter-spacing:0;color:' + MUTED + ';">' + defs.length + ' up</span>' : ''), db);
html += '<div style="color:' + MUTED + ';margin-top:6px;font-family:' + SERIF + ';font-style:italic;">DIAG, DEF and SCORE refresh the lists. SELF WANT &lt;defence&gt; watches a defence; SELF KEEP &lt;affliction&gt; hides one you keep on purpose.</div>';
html += '</div>';
try { set_custom_tab_html("Self", html); } catch (e) {}