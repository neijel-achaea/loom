// comms_render -- the Comms tab (#157): channel traffic from GMCP, in the
// game's own colours, newest at the bottom.
//   - a row of filters: All, Tells, Say, Party, then every other channel in
//     the order first heard, each with its unread count; muted ones dimmed
//   - All: every channel that isn't muted, each line tagged with its channel
//     (a click on the tag opens that channel)
//   - Tells: the people you've been telling, newest first; a click opens the
//     conversation, both sides
//   - your own lines dimmed, lines that name you marked
//   - a click on a talker's name puts "tell <name> " in the input line
// Clicks go through window.loomComms (comms_setup): the tab's page can't
// reach client. House style shared with Stats, Online, Here: ink panel,
// serif small-caps headings, monospace rows. The accent is a soft violet.
var C = client.loom.comms;
var ACC = "#b9a4e6";
var TXT = "#e6e2ec";
var MUTED = "#8c8796";
var DIM = "#5f5a68";
var RULE = "#26222e";
var INK = "#121016";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function p2(n) { return (n < 10 ? "0" : "") + n; }
function hm(t) { var d = new Date(t); return p2(d.getHours()) + ":" + p2(d.getMinutes()); }
function hms(t) { var d = new Date(t); return d.toDateString() + " " + hm(t) + ":" + p2(d.getSeconds()); }
function badge(n) { return n > 0 ? ' <span style="color:' + INK + ';background:' + ACC + ';border-radius:6px;padding:0 4px;font-size:9px;">' + n + '</span>' : ''; }
function ago(t) {
  var m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return "now";
  if (m < 60) return m + "m";
  var h = Math.floor(m / 60);
  return h < 48 ? h + "h" : Math.floor(h / 24) + "d";
}
// A line's text: its segments in their colours, the talker's name clickable.
function body(l) {
  var out = "";
  var who = (!l.me && /^[A-Za-z]+$/.test(l.talker || "")) ? l.talker : "";
  var whoRe = who ? new RegExp("\\b" + who + "\\b") : null;
  for (var i = 0; i < l.segs.length; i++) {
    var tx = l.segs[i][0];
    var st = l.segs[i][1] ? ' style="color:' + l.segs[i][1] + ';"' : '';
    var m = whoRe ? whoRe.exec(tx) : null;
    if (m) {
      out += '<span' + st + '>' + esc(tx.slice(0, m.index)) +
        '<span class="loom-cm-who" title="tell ' + who + '" onclick="window.loomComms&&window.loomComms.tell(\'' + who + '\')">' + who + '</span>' +
        esc(tx.slice(m.index + who.length)) + '</span>';
      whoRe = null;
    } else {
      out += '<span' + st + '>' + esc(tx) + '</span>';
    }
  }
  return out;
}
function firstCol(l) {
  for (var i = 0; i < l.segs.length; i++) { if (l.segs[i][1]) return l.segs[i][1]; }
  return MUTED;
}
function lineRow(l, tag) {
  var bg = l.mention ? 'background:rgba(185,164,230,0.10);border-left:2px solid ' + ACC + ';padding-left:4px;' : 'border-left:2px solid transparent;padding-left:4px;';
  var h = '<div style="display:flex;gap:6px;align-items:baseline;padding:1px 0;' + bg + (l.me ? 'opacity:0.55;' : '') + '">';
  h += '<span title="' + esc(hms(l.t)) + '" style="flex:none;width:2.9em;color:' + DIM + ';">' + hm(l.t) + '</span>';
  if (tag) {
    var tk = l.ch;
    var tn = l.conv ? l.conv : C.name(tk);
    var tv = l.conv ? "tell:" + l.conv.toLowerCase() : tk;
    h += '<span class="loom-cm-tag" title="' + esc(C.name(tk)) + '" onclick="window.loomComms&&window.loomComms.view(\'' + esc(tv).replace(/'/g, "") + '\')" style="flex:none;width:6.5em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:' + firstCol(l) + ';opacity:0.8;">' + esc(tn) + '</span>';
  }
  h += '<span style="flex:1;min-width:0;font-family:' + SERIF + ';font-size:12px;line-height:1.35;">' + body(l) + '</span></div>';
  return h;
}

// The filters: All, Tells, Say, Party, then the rest as first heard.
var keys = [];
for (var k in C.chans) { if (C.chans.hasOwnProperty(k)) keys.push(k); }
var pin = { tells: 1, says: 2, party: 3 };
keys.sort(function (a, b) { return (pin[a] || 9) - (pin[b] || 9) || C.chans[a].first - C.chans[b].first; });
var tellUnread = 0;
for (var cv in C.convs) { if (C.convs.hasOwnProperty(cv)) tellUnread += C.convs[cv].unread; }
if (C.view !== "all" && C.view !== "tells" && C.view.indexOf("tell:") !== 0 && !C.chans[C.view]) C.view = "all";
if (C.view.indexOf("tell:") === 0 && !C.convs[C.view.slice(5)]) C.view = "tells";
var allUnread = 0;
for (var ku = 0; ku < keys.length; ku++) { if (!C.muted[keys[ku]]) allUnread += keys[ku] === "tells" ? tellUnread : C.chans[keys[ku]].unread; }
C.chips = ["all"].concat(keys);
function chip(i, label, n, on, muted) {
  return '<span class="loom-cm-chip" onclick="window.loomComms&&window.loomComms.chip(' + i + ')" title="' + esc(label) + (muted ? ' (muted)' : '') + '" style="color:' + (on ? ACC : (muted ? DIM : MUTED)) + ';border-bottom:1px solid ' + (on ? ACC : 'transparent') + ';' + (muted ? 'text-decoration:line-through;' : '') + '">' + esc(label.length > 16 ? label.slice(0, 15) + "…" : label) + badge(n) + '</span>';
}
var inTells = C.view === "tells" || C.view.indexOf("tell:") === 0;
var html = '<div id="loom-comms" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + INK + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DIM + ';padding-bottom:3px;">';
html += '<span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:2px;font-size:15px;color:' + ACC + ';">Comms</span>';
if (C.chans[C.view] && C.view !== "all") {
  html += '<span class="loom-cm-chip" onclick="window.loomComms&&window.loomComms.mute()" style="color:' + (C.muted[C.view] ? ACC : MUTED) + ';">' + (C.muted[C.view] ? 'unmute ' : 'mute ') + esc(C.name(C.view)) + '</span>';
}
html += '</div>';
html += '<div style="display:flex;flex-wrap:wrap;gap:4px 10px;margin:5px 0 4px;">';
html += chip(0, "All", allUnread, C.view === "all", false);
for (var ci = 0; ci < keys.length; ci++) {
  var ck = keys[ci];
  html += chip(ci + 1, C.name(ck), C.muted[ck] ? 0 : (ck === "tells" ? tellUnread : C.chans[ck].unread), C.view === ck || (ck === "tells" && inTells), !!C.muted[ck]);
}
html += '</div><div style="border-top:1px solid ' + RULE + ';padding-top:4px;">';

if (C.view === "tells") {
  // The conversations, newest first.
  var cl = [];
  for (var cn in C.convs) { if (C.convs.hasOwnProperty(cn)) cl.push(C.convs[cn]); }
  cl.sort(function (a, b) { return b.last - a.last; });
  var tl = C.chans.tells ? C.chans.tells.lines : [];
  if (!cl.length) html += '<div style="color:' + MUTED + ';padding:6px 0;">no tells yet.</div>';
  for (var cj = 0; cj < cl.length; cj++) {
    var cc = cl[cj];
    var lastL = null;
    for (var tj = tl.length - 1; tj >= 0; tj--) { if (tl[tj].conv && tl[tj].conv.toLowerCase() === cc.name.toLowerCase()) { lastL = tl[tj]; break; } }
    var prev = "";
    if (lastL) { for (var sj = 0; sj < lastL.segs.length; sj++) prev += lastL.segs[sj][0]; }
    html += '<div class="loom-cm-conv" onclick="window.loomComms&&window.loomComms.view(\'tell:' + cc.name.toLowerCase().replace(/[^a-z]/g, "") + '\')" style="display:flex;gap:8px;align-items:baseline;padding:3px 0;border-bottom:1px dotted ' + RULE + ';">';
    html += '<span style="flex:none;width:7em;font-family:' + SERIF + ';font-size:12px;color:' + (cc.unread ? ACC : TXT) + ';">' + esc(cc.name) + badge(cc.unread) + '</span>';
    html += '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:' + MUTED + ';">' + esc(prev) + '</span>';
    html += '<span style="flex:none;color:' + DIM + ';">' + (cc.last ? ago(cc.last) : '') + '</span></div>';
  }
} else {
  var rows = [];
  var tag = false;
  if (C.view === "all") {
    tag = true;
    for (var ak = 0; ak < keys.length; ak++) {
      if (C.muted[keys[ak]]) continue;
      var al = C.chans[keys[ak]].lines;
      for (var ai = Math.max(0, al.length - 200); ai < al.length; ai++) rows.push(al[ai]);
    }
    rows.sort(function (a, b) { return a.s - b.s; });
    if (rows.length > 200) rows = rows.slice(rows.length - 200);
  } else if (C.view.indexOf("tell:") === 0) {
    var who = C.convs[C.view.slice(5)];
    html += '<div style="margin-bottom:3px;"><span class="loom-cm-chip" onclick="window.loomComms&&window.loomComms.view(\'tells\')" style="color:' + MUTED + ';">&larr; tells</span> <span style="font-family:' + SERIF + ';font-size:12px;color:' + ACC + ';">&middot; ' + esc(who.name) + '</span>' +
      ' <span class="loom-cm-who" onclick="window.loomComms&&window.loomComms.tell(\'' + who.name.replace(/[^A-Za-z]/g, "") + '\')" style="color:' + MUTED + ';">(reply)</span></div>';
    var wl = C.chans.tells ? C.chans.tells.lines : [];
    for (var wi = 0; wi < wl.length; wi++) { if (wl[wi].conv && wl[wi].conv.toLowerCase() === who.name.toLowerCase()) rows.push(wl[wi]); }
  } else {
    rows = C.chans[C.view].lines;
  }
  if (!rows.length) html += '<div style="color:' + MUTED + ';padding:6px 0;">' + (keys.length ? 'nothing here yet.' : 'nothing heard yet: channel lines show up here as they come.') + '</div>';
  var oldSeen = false;
  for (var ri = 0; ri < rows.length; ri++) {
    if (rows[ri].old) oldSeen = true;
    else if (oldSeen) { html += '<div style="text-align:center;color:' + DIM + ';margin:3px 0;border-top:1px dotted ' + RULE + ';">before the reload &uarr;</div>'; oldSeen = false; }
    html += lineRow(rows[ri], tag);
  }
}
html += '</div>';
var mutedL = [];
for (var mk in C.muted) { if (C.muted.hasOwnProperty(mk)) mutedL.push(C.name(mk)); }
html += '<div style="display:flex;justify-content:space-between;margin-top:6px;color:' + DIM + ';">';
html += '<span>' + (mutedL.length ? 'muted: ' + esc(mutedL.join(", ")) : '') + '</span><span>keeps ' + C.cap + ' a channel</span></div>';
html += '</div>';

// The page style: the panel filling its tab, and hover on what's clickable.
try {
  var cmSt = document.getElementById("loom-comms-style");
  if (!cmSt) { cmSt = document.createElement("style"); cmSt.id = "loom-comms-style"; document.head.appendChild(cmSt); }
  var cmCss = '.flexlayout__tab:has(#loom-comms) { background: ' + INK + ' !important; } .flexlayout__tab:has(#loom-comms) > * { min-height: 100%; }' +
    ' .loom-cm-chip, .loom-cm-tag, .loom-cm-conv, .loom-cm-who { cursor: pointer; } .loom-cm-chip:hover, .loom-cm-tag:hover { color: ' + TXT + ' !important; }' +
    ' .loom-cm-conv:hover { background: rgba(185,164,230,0.06); } .loom-cm-who { text-decoration: underline dotted rgba(255,255,255,0.35); text-underline-offset: 2px; } .loom-cm-who:hover { text-decoration-color: currentColor; }';
  if (cmSt.textContent !== cmCss) cmSt.textContent = cmCss;
} catch (e) {}

// Newest at the bottom: stay there if you were there (or the view changed);
// leave the scroll alone while you read back.
var cmSc = null, cmBottom = true;
try {
  var cmEl = document.getElementById("loom-comms");
  for (var cmP = cmEl ? cmEl.parentElement : null; cmP; cmP = cmP.parentElement) {
    if (cmP.scrollHeight > cmP.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(cmP).overflowY)) { cmSc = cmP; break; }
  }
  if (cmSc) cmBottom = cmSc.scrollHeight - cmSc.scrollTop - cmSc.clientHeight < 40;
} catch (e) {}
var cmJump = C.jump || cmBottom;
C.jump = false;
try { set_custom_tab_html(C.tab, html); } catch (e) {}
if (cmJump) {
  setTimeout(function () {
    try {
      var el = document.getElementById("loom-comms");
      for (var p = el ? el.parentElement : null; p; p = p.parentElement) {
        if (p.scrollHeight > p.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(p).overflowY)) { p.scrollTop = p.scrollHeight; break; }
      }
    } catch (e) {}
  }, 20);
}
