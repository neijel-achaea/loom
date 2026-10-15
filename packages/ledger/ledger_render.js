// ledger_render -- rebuild the 'Ledger' custom tab in the house style shared with Coffers and
// Level: ink panel, serif small-caps headings, one large figure (here the
// Achaean date), monospace ledger rows. Accents are parchment, sepia ink and
// sealing-wax red for anything overdue.
if (!client.loom || !client.loom.ledger || !client.loom.ledger.months) run_function("ledger_setup", [], "ledger");
var items = [];
try { items = JSON.parse(get_variable("ledger_items")) || []; } catch (e) { items = []; }
var today = client.loom.ledger.day;

var PARCH = "#e6d5ac";
var SEPIA = "#8b6b47";
var WAX = "#d0604c";
var AMBER = "#e0a95a";
var TXT = "#e4dccb";
var MUTED = "#8c8272";
var RULE = "#352c22";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
var SOON = 5;

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function rel(mag) {
  var mm = Math.floor(mag / 25);
  var dd = mag % 25;
  var r = "";
  if (mm > 0) { r = mm + "mo"; }
  if (dd > 0) { r = r + (r.length ? " " : "") + dd + "d"; }
  return r;
}
function dayName(d) {
  var n = d - 1;
  var y = Math.floor(n / 300);
  var rem = n - y * 300;
  return client.loom.ledger.ord((rem % 25) + 1) + " " + client.loom.ledger.months[Math.floor(rem / 25)];
}
function caps(t, col) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (col || SEPIA) + ';font-size:11px;margin:0 0 2px;">' + t + '</div>'; }
function section(title, inner, col) { return '<div style="border-top:1px solid ' + RULE + ';margin-top:8px;padding-top:5px;">' + caps(title, col) + inner + '</div>'; }
function quiet(t) { return '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">' + t + '</div>'; }
// Items another package added (#34) carry their source, muted.
function srcMark(it) { return (it.source && it.source !== "manual") ? ' <span style="color:' + MUTED + ';" title="added by ' + esc(it.source) + '">&middot; ' + esc(it.source) + '</span>' : ''; }
// One ledger line: entry number in the margin, the text, and the reckoning on the right.
function entry(id, text, right, rightCol, textCol) {
  return '<div style="display:flex;gap:6px;align-items:baseline;border-bottom:1px dotted ' + RULE + ';padding:2px 0;">' +
    '<span style="color:' + SEPIA + ';min-width:2.4em;">#' + id + '</span>' +
    '<span style="flex:1 1 auto;min-width:0;color:' + (textCol || TXT) + ';">' + text + '</span>' +
    '<span style="color:' + rightCol + ';white-space:nowrap;text-align:right;">' + right + '</span></div>';
}

// Sort: dated by due day, standing by oldest touch first.
var dated = [];
var standing = [];
var i, j, cur;
for (i = 0; i < items.length; i++) { if (items[i].due) { dated.push(items[i]); } else { standing.push(items[i]); } }
for (i = 1; i < dated.length; i++) {
  cur = dated[i]; j = i - 1;
  while (j >= 0 && dated[j].due > cur.due) { dated[j + 1] = dated[j]; j--; }
  dated[j + 1] = cur;
}
for (i = 1; i < standing.length; i++) {
  cur = standing[i]; j = i - 1;
  while (j >= 0 && standing[j].touched > cur.touched) { standing[j + 1] = standing[j]; j--; }
  standing[j + 1] = cur;
}
var overdue = 0, soon = 0;
for (i = 0; i < dated.length; i++) {
  if (today > 0 && dated[i].due < today) { overdue++; }
  else if (today > 0 && dated[i].due - today <= SOON) { soon++; }
}

// A quill for the title, the ledger's counterpart of the coin stack.
var quill = '<svg width="16" height="17" viewBox="0 0 16 17" style="vertical-align:-3px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M14.5 1 C9 2.5 5.5 6.5 3.5 12.5 L5 12.8 C7 8 10 4.5 14.5 1 Z" fill="' + PARCH + '"/>' +
  '<path d="M14.5 1 C10.5 4 7.5 8 5 12.8" fill="none" stroke="' + SEPIA + '" stroke-width="0.7"/>' +
  '<path d="M3.5 12.5 L2.2 15.8" stroke="' + PARCH + '" stroke-width="1.1"/><circle cx="2" cy="16" r="0.9" fill="' + WAX + '"/></svg>';

var html = '<div style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#15120e;border:1px solid ' + RULE + ';padding:7px 8px 8px;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + SEPIA + ';padding-bottom:3px;">';
html += '<div style="font-family:' + SERIF + ';color:' + PARCH + ';font-size:14px;letter-spacing:0.22em;">' + quill + 'LEDGER</div>';
var tally = [];
if (overdue > 0) { tally.push('<span style="color:' + WAX + ';">' + overdue + ' overdue</span>'); }
if (soon > 0) { tally.push('<span style="color:' + AMBER + ';">' + soon + ' soon</span>'); }
tally.push(standing.length + ' standing');
html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + SEPIA + ';font-size:11px;">' + tally.join(' &middot; ') + '</div></div>';

// The date itself is the headline figure.
if (today > 0) {
  var n = today - 1;
  var yy = Math.floor(n / 300);
  var rem = n - yy * 300;
  var mi = Math.floor(rem / 25);
  var dd = (rem % 25) + 1;
  html += '<div style="margin:6px 0 2px;"><span style="font-family:' + SERIF + ';font-size:24px;color:' + PARCH + ';">' + client.loom.ledger.ord(dd) + ' ' + client.loom.ledger.months[mi] + '</span>';
  html += ' <span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">the year ' + yy + ' AF</span></div>';

  // The month as a strip of 25 days: past days faded, today lit, and a wax
  // dot on any day this month that has something due.
  var monthStart = yy * 300 + mi * 25 + 1;
  var marks = {};
  for (i = 0; i < dated.length; i++) {
    if (dated[i].due >= monthStart && dated[i].due < monthStart + 25) { marks[dated[i].due - monthStart + 1] = dated[i].due < today ? WAX : AMBER; }
  }
  var strip = '<div style="display:flex;gap:2px;margin:3px 0 1px;">';
  for (var c = 1; c <= 25; c++) {
    var bg = c < dd ? "#2a231b" : (c === dd ? PARCH : "#1f1a14");
    var bd = c === dd ? PARCH : (c < dd ? "#2a231b" : RULE);
    strip += '<div style="flex:1 1 0;height:9px;background:' + bg + ';border:1px solid ' + bd + ';position:relative;">';
    if (marks[c]) { strip += '<div style="position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:50%;background:' + (c === dd ? "#15120e" : marks[c]) + ';"></div>'; }
    strip += '</div>';
  }
  strip += '</div>';
  html += strip;
  html += '<div style="display:flex;justify-content:space-between;color:' + MUTED + ';"><span>1st ' + client.loom.ledger.months[mi] + '</span><span>' + (25 - dd) + ' day' + (25 - dd === 1 ? '' : 's') + ' left in the month</span><span>25</span></div>';
} else {
  html += '<div style="margin:6px 0 2px;font-family:' + SERIF + ';font-size:18px;color:' + MUTED + ';font-style:italic;">date not yet known</div>';
  html += '<div style="color:' + MUTED + ';">LEDGER DATE asks the game.</div>';
}

// Approaching: dated items in due order.
var ap = "";
if (dated.length === 0) {
  ap = quiet("Nothing on the calendar.");
} else {
  for (i = 0; i < dated.length; i++) {
    var diff = dated[i].due - today;
    var r = rel(diff < 0 ? -diff : diff);
    var when, col;
    if (diff < 0) { when = "overdue " + r; col = WAX; }
    else if (diff === 0) { when = "today"; col = AMBER; }
    else if (diff <= SOON) { when = "in " + r; col = AMBER; }
    else { when = "in " + r; col = TXT; }
    var txt = esc(dated[i].text) + srcMark(dated[i]);
    if (dated[i].repeat) { txt += ' <span style="color:' + SEPIA + ';" title="repeats">&#8635;</span>'; }
    var right = '<span style="color:' + MUTED + ';">' + dayName(dated[i].due) + '</span>&nbsp; ' + when;
    ap += entry(dated[i].id, txt, right, col, diff < 0 ? WAX : TXT);
  }
}
html += section("Approaching", ap, PARCH);

// Standing: undated items, oldest touch first; long neglect warms toward amber.
var st = "";
if (standing.length === 0) {
  st = quiet("Nothing outstanding.");
} else {
  for (i = 0; i < standing.length; i++) {
    var age = today - standing[i].touched;
    var arel = rel(age);
    if (!arel.length) { arel = "fresh"; }
    else { arel = "untouched " + arel; }
    st += entry(standing[i].id, esc(standing[i].text) + srcMark(standing[i]), arel, age >= 50 ? AMBER : MUTED);
  }
}
html += section("Standing", st, PARCH);

html += '</div>';
try { set_custom_tab_html("Ledger", html); } catch (e) {}