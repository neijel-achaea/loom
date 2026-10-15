// social_online -- the Online tab (#76): the watched people who are online,
// one row each, alphabetical, in the colour of their group. Watched means in
// a group that SOCIAL WATCH covers, so the tab agrees with the "has awoken"
// notices. Drawn after every QW poll (social_flush); nothing is sent for it.
//   - arrivals glow for S.flashMs, departures stay greyed for as long
//   - "online for", counted from the first poll that saw them
//   - the group's name in a tooltip on the name (Ricardo: colour is enough)
//   - below, OFFLINE: the other watched people, last seen most recent first,
//     folded or shown by clicking its heading or with SOCIAL OFFLINE ON/OFF
//   - room on each row for columns other packages may add (#196 standings,
//     #197 ledger, through the display entry point #159); none yet
// House style shared with Stats, DmgChart, Standings: ink panel, serif
// small-caps headings, monospace rows. The accent is a moonlit teal.
var S = client.loom.social;
var TEAL = "#7fd6c8";
var DEEP = "#3f6f69";
var TXT = "#e2e8e6";
var MUTED = "#86908e";
var RULE = "#232b2a";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
var now = Date.now();
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function cap(n) { return n.charAt(0).toUpperCase() + n.slice(1); }
function p2(n) { return (n < 10 ? "0" : "") + n; }
function agoTxt(ms) {
  var m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  var h = Math.floor(m / 60);
  if (h < 48) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}
function forTxt(ms) {
  var m = Math.floor(ms / 60000);
  if (m < 1) return "&lt;1m";
  if (m < 60) return m + "m";
  return Math.floor(m / 60) + "h " + p2(m % 60) + "m";
}

// name -> its first watched group, in priority order (the colour it takes).
var grp = {};
var watchedN = 0;
for (var gi = 0; gi < S.groups.length; gi++) {
  var g = S.groups[gi];
  if (!S.watch[g]) continue;
  for (var nm in S.lists[g]) {
    if (S.lists[g].hasOwnProperty(nm) && !grp[nm] && nm !== S.me) { grp[nm] = g; watchedN++; }
  }
}

// Rows: watched and online, plus watched people who just left.
var rows = [];
var onN = 0;
var on = S.prev || {};
for (var n1 in on) {
  if (on.hasOwnProperty(n1) && grp[n1]) { rows.push({ n: n1, out: false }); onN++; }
}
var fl = S.flash || {};
for (var n2 in fl) {
  if (!fl.hasOwnProperty(n2)) continue;
  if (now - fl[n2].at > S.flashMs) { delete fl[n2]; continue; }
  if (fl[n2].kind === "out" && grp[n2] && !on[n2]) rows.push({ n: n2, out: true });
}
rows.sort(function (a, b) { return a.n < b.n ? -1 : (a.n > b.n ? 1 : 0); });

var dt = S.lastPoll ? new Date(S.lastPoll) : null;
var polling = get_variable("social_poll") == "on";
var html = '<div style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#0f1312;border:1px solid ' + RULE + ';padding:7px 8px 8px;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
html += '<div style="font-family:' + SERIF + ';color:' + TEAL + ';font-size:14px;letter-spacing:0.22em;">ONLINE</div>';
html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + MUTED + ';font-size:11px;"><span style="color:' + TEAL + ';">' + onN + '</span> of ' + watchedN + ' watched</div></div>';

if (!watchedN) {
  html += '<div style="margin-top:8px;color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">Nobody is watched yet. Add people to a group (SOCIAL ADD &lt;group&gt; &lt;name&gt;) and watch it (SOCIAL WATCH).</div>';
} else if (S.prev === null) {
  html += '<div style="margin-top:8px;color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">' + (polling ? "Waiting for the first poll…" : "Polling is off (SOCIAL POLL ON).") + '</div>';
} else if (!rows.length) {
  html += '<div style="margin-top:8px;color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">None of your watched people are online.</div>';
} else {
  html += '<div style="margin-top:5px;">';
  for (var ri = 0; ri < rows.length; ri++) {
    var r = rows[ri];
    var g2 = grp[r.n];
    var col = S.color[g2] || TXT;
    var f = fl[r.n];
    var glow = !r.out && f && f.kind === "in";
    var nameStyle = r.out ? 'color:' + MUTED + ';text-decoration:line-through;' : 'color:' + col + ';' + (glow ? 'font-weight:bold;text-shadow:0 0 6px ' + col + ',0 0 2px ' + col + ';' : '');
    var since = (S.since && S.since[r.n]) ? now - S.since[r.n] : null;
    var right = r.out ? "logged out" : (glow ? "logged in" : (since !== null ? forTxt(since) : ""));
    html += '<div style="display:flex;align-items:baseline;gap:8px;border-bottom:1px dotted ' + RULE + ';padding:2px 0;' + (r.out ? 'opacity:0.6;' : '') + '">';
    html += '<span title="' + esc(g2) + '" style="flex:1 1 auto;white-space:nowrap;font-family:' + SERIF + ';font-size:12px;cursor:default;' + nameStyle + '">' + esc(cap(r.n)) + '</span>';
    // Integration columns (#196, #197) go here, between the name and the time.
    html += '<span style="min-width:5.5em;text-align:right;color:' + (r.out ? MUTED : (glow ? col : MUTED)) + ';white-space:nowrap;">' + right + '</span>';
    html += '</div>';
  }
  html += '</div>';
}
// OFFLINE: watched people not online (nor just left), last seen most recent
// first, never seen last. The heading folds it: a click flips it on the page
// only (until the next redraw keeps it, through S.showOffline); SOCIAL
// OFFLINE ON/OFF sets it for good.
if (watchedN && S.prev !== null) {
  var off = [];
  for (var n3 in grp) {
    if (grp.hasOwnProperty(n3) && !on[n3] && !(fl[n3] && fl[n3].kind === "out")) off.push({ n: n3, seen: (S.seen && S.seen[n3]) || 0 });
  }
  off.sort(function (a, b) { return (b.seen - a.seen) || (a.n < b.n ? -1 : (a.n > b.n ? 1 : 0)); });
  if (off.length) {
    var shown = S.showOffline !== false;
    var tog = "var d=this.nextSibling,v=d.style.display=='none';d.style.display=v?'block':'none';this.firstChild.textContent=v?'\\u25BE ':'\\u25B8 ';try{client.loom.social.showOffline=v;}catch(e){}";
    html += '<div onclick="' + tog + '" style="cursor:pointer;margin-top:9px;border-top:1px solid ' + RULE + ';padding-top:5px;font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;font-size:11px;color:' + DEEP + ';"><span>' + (shown ? '\u25BE ' : '\u25B8 ') + '</span>offline <span style="color:' + MUTED + ';">' + off.length + '</span></div>';
    html += '<div style="display:' + (shown ? 'block' : 'none') + ';">';
    for (var oi = 0; oi < off.length; oi++) {
      var o = off[oi];
      html += '<div style="display:flex;align-items:baseline;gap:8px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;opacity:0.55;">';
      html += '<span title="' + esc(grp[o.n]) + '" style="flex:1 1 auto;white-space:nowrap;font-family:' + SERIF + ';font-size:11px;cursor:default;color:' + (S.color[grp[o.n]] || TXT) + ';">' + esc(cap(o.n)) + '</span>';
      html += '<span style="min-width:5.5em;text-align:right;color:' + MUTED + ';white-space:nowrap;">' + (o.seen ? agoTxt(now - o.seen) : "not seen yet") + '</span>';
      html += '</div>';
    }
    html += '</div>';
  }
}
html += '<div style="display:flex;justify-content:space-between;margin-top:6px;color:' + MUTED + ';">';
html += '<span>' + (S.qwTotal ? S.lastCount + ' visible &middot; ' + S.qwHidden + ' hidden &middot; ' + S.qwTotal + ' total' : '') + '</span>';
html += '<span>' + (polling ? (dt ? 'last poll ' + p2(dt.getHours()) + ':' + p2(dt.getMinutes()) + ':' + p2(dt.getSeconds()) : '') : '<span style="color:#e0a05a;">polling off</span>') + '</span></div>';
html += '</div>';
try { set_custom_tab_html("Online", html); } catch (e) {}
