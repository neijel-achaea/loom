// chronicle_render -- the 'Chronicle' custom tab, in the house style shared
// with Ledger and Coffers: ink panel, serif small-caps headings, monospace
// rows. Today's record, newest first; then the earlier days kept, with how
// much each holds.
if (!client.loom || !client.loom.chronicle || !client.loom.chronicle.line) run_function("chronicle_setup", [], "chronicle");
var CR = client.loom.chronicle;
CR.borrowDate();

// Tab theme (#310): loom's city palette when one is on, else this tab's own colours.
var TH = (client.loom && client.loom.theme) || {};
var PARCH = TH.acc || "#e6d5ac";
var SEPIA = TH.deep || "#8b6b47";
var TXT = TH.txt || "#e4dccb";
var MUTED = TH.muted || "#8c8272";
var RULE = TH.rule || "#352c22";
var BG = TH.bg || "#15120e";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
// One colour per kind, muted enough to read as ink.
var KIND = {
  place: ["#9cc96b", "place"], stay: ["#9cc96b", "stay"], chan: ["#7fb2c9", "said"], emote: ["#c9a27f", "emote"],
  letter: ["#e0a95a", "letter"], msg: ["#e0a95a", "message"], news: ["#e0a95a", "news"], note: ["#e6d5ac", "note"], link: ["#b39ddb", "deed"]
};

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function caps(t, col) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (col || SEPIA) + ';font-size:11px;margin:0 0 2px;">' + t + '</div>'; }
function section(title, inner, col) { return '<div style="border-top:1px solid ' + RULE + ';margin-top:8px;padding-top:5px;">' + caps(title, col) + inner + '</div>'; }
function quiet(t) { return '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">' + t + '</div>'; }
// One row: the time in the margin, the kind, and the entry. Long texts
// (letters, news) show their first line; the whole text on hover.
function row(e) {
  var kd = KIND[e.k] || [TXT, e.k];
  var full = CR.show(e);
  var first = full.split("\n")[0];
  var more = full.indexOf("\n") >= 0;
  return '<div style="display:flex;gap:6px;align-items:baseline;border-bottom:1px dotted ' + RULE + ';padding:2px 0;"' + (more ? ' title="' + esc(CR.clip(full, 1500)) + '"' : '') + '>' +
    '<span style="color:' + SEPIA + ';min-width:3.2em;">' + CR.hhmm(e.t) + '</span>' +
    '<span style="color:' + kd[0] + ';min-width:4.6em;font-family:' + SERIF + ';font-variant:small-caps;">' + kd[1] + '</span>' +
    '<span style="flex:1 1 auto;min-width:0;color:' + TXT + ';overflow-wrap:anywhere;">' + esc(first) + (more ? ' <span style="color:' + MUTED + ';">&hellip;</span>' : '') + '</span></div>';
}

var book = '<svg width="16" height="16" viewBox="0 0 16 16" style="vertical-align:-3px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M8 4 C6 2.6 3.5 2.4 1 3 L1 13 C3.5 12.4 6 12.6 8 14 Z" fill="' + PARCH + '"/><path d="M8 4 C10 2.6 12.5 2.4 15 3 L15 13 C12.5 12.4 10 12.6 8 14 Z" fill="' + PARCH + '" opacity="0.8"/>' +
  '<path d="M8 4 L8 14" stroke="' + SEPIA + '" stroke-width="0.8"/></svg>';

var today = CR.today();
var cur = CR.bucket(today, false);
var html = '<div id="loom-chronicle" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + SEPIA + ';padding-bottom:3px;">';
html += '<div style="font-family:' + SERIF + ';color:' + PARCH + ';font-size:14px;letter-spacing:0.22em;">' + book + 'CHRONICLE</div>';
html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + SEPIA + ';font-size:11px;">' + (cur ? cur.ev.length : 0) + ' today &middot; ' + CR.days.length + ' day' + (CR.days.length === 1 ? '' : 's') + ' kept</div></div>';

if (today) {
  html += '<div style="margin:6px 0 2px;"><span style="font-family:' + SERIF + ';font-size:20px;color:' + PARCH + ';">' + esc(CR.dayName(today).replace(/, \d+ AF$/, "")) + '</span>';
  html += ' <span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">' + esc(CR.dayName(today).replace(/^.*, /, "the year ")) + '</span></div>';
} else {
  html += '<div style="margin:6px 0 2px;font-family:' + SERIF + ';font-size:18px;color:' + MUTED + ';font-style:italic;">date not yet known</div>';
  html += '<div style="color:' + MUTED + ';">It comes with the next hour\'s date line, or type DATE.</div>';
}

// A summary, in the chronicle's hand.
function prose(sum, size) {
  return '<div style="font-family:' + SERIF + ';font-size:' + (size || 12) + 'px;line-height:1.45;color:' + TXT + ';margin:3px 0 4px;">' + esc(sum.text) +
    (sum.draft ? ' <span style="color:' + MUTED + ';font-style:italic;font-size:10px;">(so far)</span>' : '') + '</div>';
}
// What a summary still to come says about itself.
function pending(it, finished) {
  if (CR.busy && CR.writing === it) return "being written…";
  if (!CR.getKey() || !finished) return "";
  if (CR.fails(it) >= CR.retryMs.length) return "summary failed";
  return CR.auto ? "summary to come" : "";
}
function entry(title, right, sum, size) {
  return '<div style="border-bottom:1px dotted ' + RULE + ';padding:3px 0;">' +
    '<div style="display:flex;gap:6px;align-items:baseline;">' +
    '<span style="flex:1 1 auto;color:' + PARCH + ';font-family:' + SERIF + ';font-size:' + (size ? size + 1 : 12) + 'px;">' + esc(title) + '</span>' +
    '<span style="color:' + MUTED + ';white-space:nowrap;">' + esc(right || "") + '</span></div>' +
    (sum ? prose(sum, size) : '') + '</div>';
}
// The three views, as headings to click.
var VIEWS = [["days", "Days"], ["months", "Months"], ["years", "Years"]];
var tabs = '<div style="display:flex;gap:14px;margin:7px 0 0;border-bottom:1px solid ' + RULE + ';">';
for (var v = 0; v < VIEWS.length; v++) {
  var on = CR.view === VIEWS[v][0];
  tabs += '<span onclick="window.loomChronicle&&window.loomChronicle.view(\'' + VIEWS[v][0] + '\')" style="cursor:pointer;user-select:none;font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;font-size:12px;padding:0 1px 2px;' +
    'color:' + (on ? PARCH : MUTED) + ';border-bottom:2px solid ' + (on ? SEPIA : "transparent") + ';margin-bottom:-1px;">' + VIEWS[v][1] + '</span>';
}
html += tabs + '</div>';

var curM = today ? CR.monthOf(today) : -1, curY = today ? CR.yearOf(today) : -1;
if (CR.view === "months") {
  // The months of this year (and the last, while this one is young), newest first.
  var mset = {}, mk;
  for (var di = 0; di < CR.days.length; di++) { if (CR.days[di].d > 0) mset[CR.monthOf(CR.days[di].d)] = true; }
  for (mk in CR.annals.m) { if (CR.annals.m.hasOwnProperty(mk)) mset[mk] = true; }
  var mlist = Object.keys(mset).map(Number).filter(function (m) { return curY < 0 || Math.floor(m / 12) >= curY - 1; }).sort(function (a, b) { return b - a; });
  var mh = "";
  for (var mi = 0; mi < mlist.length; mi++) {
    var m = mlist[mi], ds = CR.daysOfMonth(m), sm = CR.annals.m[m];
    var played = ds.length + " day" + (ds.length === 1 ? "" : "s") + " played";
    mh += entry(CR.monthName(m), (m === curM ? "this month · " : "") + (sm ? played : (pending("m" + m, m < curM) || played)), sm, 12);
  }
  html += mh || '<div style="margin-top:6px;">' + quiet("No months yet. A month's summary is written when it ends, from the summaries of its days (an Achaean month is about a day of real time).") + '</div>';
} else if (CR.view === "years") {
  var yset = {}, yk;
  for (var dj = 0; dj < CR.days.length; dj++) { if (CR.days[dj].d > 0) yset[CR.yearOf(CR.days[dj].d)] = true; }
  for (yk in CR.annals.m) { if (CR.annals.m.hasOwnProperty(yk)) yset[Math.floor(yk / 12)] = true; }
  for (yk in CR.annals.y) { if (CR.annals.y.hasOwnProperty(yk)) yset[yk] = true; }
  var ylist = Object.keys(yset).map(Number).sort(function (a, b) { return b - a; });
  var yh = "";
  for (var yi = 0; yi < ylist.length; yi++) {
    var y = ylist[yi], sy = CR.annals.y[y], nm = CR.monthsOfYear(y).length;
    var mp = nm + " month" + (nm === 1 ? "" : "s");
    yh += entry(CR.yearName(y).replace(/^the y/, "Y"), (y === curY ? "this year · " : "") + (sy ? mp : (pending("y" + y, y < curY) || mp)), sy, 13);
  }
  html += yh || '<div style="margin-top:6px;">' + quiet("No years yet. A year's summary is written when it ends, from its months (an Achaean year is about twelve days of real time).") + '</div>';
} else {
  // Today, newest first.
  var td = "";
  if (cur && cur.sum) td += prose(cur.sum);
  if (!cur || !cur.ev.length) td += quiet("Nothing recorded yet this day.");
  else {
    var shown = 0;
    for (var i = cur.ev.length - 1; i >= 0 && shown < 150; i--, shown++) td += row(cur.ev[i]);
    if (cur.ev.length > shown) td += quiet((cur.ev.length - shown) + " earlier entries: CHRONICLE EXPORT for all of them.");
  }
  html += section(today ? "This day" : "Before the date was known", td, PARCH);
  // Earlier days, newest first: the summary when there is one, and what the
  // record holds.
  var ea = "";
  for (var j = CR.days.length - 1; j >= 0; j--) {
    var b = CR.days[j];
    if (b === cur) continue;
    var n = {};
    for (var k = 0; k < b.ev.length; k++) n[b.ev[k].k] = (n[b.ev[k].k] || 0) + 1;
    var bits = [];
    if (n.place || n.stay) bits.push(((n.place || 0) + (n.stay || 0)) + " places");
    if (n.chan) bits.push(n.chan + " said");
    if (n.emote) bits.push(n.emote + " emotes");
    if (n.letter || n.msg || n.news) bits.push(((n.letter || 0) + (n.msg || 0) + (n.news || 0)) + " read");
    if (n.note) bits.push(n.note + " notes");
    if (n.link) bits.push(n.link + " deeds");
    var state = (!b.sum && b.d > 0 && b.ev.length) ? pending(b.d, true) : "";
    ea += entry(CR.dayName(b.d), state || bits.join(" · ") || (b.sum ? "" : "empty"), b.sum);
  }
  if (ea) html += section("Earlier days", ea, PARCH);
}
if (!CR.getKey()) html += '<div style="margin-top:8px;color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">No summaries without an API key: CHRONICLE HELP.</div>';
html += '</div>';
// The whole tab in the panel's colour (#355), as Ledger does.
try {
  var crSt = document.getElementById("loom-chronicle-style");
  if (!crSt) { crSt = document.createElement("style"); crSt.id = "loom-chronicle-style"; document.head.appendChild(crSt); }
  var crCss = '.flexlayout__tab:has(#loom-chronicle) { background: ' + BG + ' !important; } .flexlayout__tab:has(#loom-chronicle) > * { min-height: 100%; }';
  if (crSt.textContent !== crCss) crSt.textContent = crCss;
} catch (e) {}
try { set_custom_tab_html("Chronicle", html); } catch (e) {}
