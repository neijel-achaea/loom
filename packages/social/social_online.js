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
// Through loom's display entry point (#159): your standing with each person
// (#196, from standings), when both are installed and the link is on.
var LL = client.loom.loom;
function ask(q, n) { return (LL && LL.answer) ? LL.answer("social", q, n) : undefined; }
// The standing column: the band's icon in its colour (Ricardo: icons, the
// words on hover), an arrow when it moved in the last few days; the band,
// score and recent dealings on hover. Empty for someone not on the books, so
// the column stays quiet. Falls back to the band's name with no icon.
function standCell(n) {
  var st = ask("person.standing", cap(n));
  if (!st) return '<span style="flex:none;min-width:2.6em;"></span>';
  var arrow = st.trend > 0 ? ' &#9650;' : (st.trend < 0 ? ' &#9660;' : '');
  var sc = (st.score > 0 ? "+" : "") + (Math.round(st.score * 10) / 10).toFixed(1);
  var tip = st.band + " " + sc + (st.recent ? ", " + st.recent + " dealing" + (st.recent === 1 ? "" : "s") + " in the last few days" + (st.trend > 0 ? ", up" : (st.trend < 0 ? ", down" : "")) : "");
  var mark = st.icon ? '<span style="font-family:\'Segoe UI Symbol\',\'DejaVu Sans\',\'Noto Sans Symbols\',\'Noto Sans Symbols 2\',sans-serif;font-size:12px;">' + esc(st.icon) + '\ufe0e</span>' : esc(st.band);
  return '<span title="' + esc(tip) + '" style="flex:none;min-width:2.6em;text-align:right;white-space:nowrap;cursor:default;color:' + esc(st.colour) + ';">' + mark + '<span style="font-size:8px;">' + arrow + '</span></span>';
}
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

// A name's colour: its first watched group's, or in SOCIAL COLOURS STANDINGS
// mode its band's (plain when not on the books; groups ignored, #60).
function nameCol(n, g) { return S.colourBy === "standings" ? (S.nameColour(n) || TXT) : (S.color[g] || TXT); }

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
var html = '<div id="loom-online" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#0f1312;border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;">';
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
    var col = nameCol(r.n, g2);
    var f = fl[r.n];
    var glow = !r.out && f && f.kind === "in";
    var nameStyle = r.out ? 'color:' + MUTED + ';text-decoration:line-through;' : 'color:' + col + ';' + (glow ? 'font-weight:bold;text-shadow:0 0 6px ' + col + ',0 0 2px ' + col + ';' : '');
    // Online since their login, or since yours if we never saw theirs.
    var sinceAt = (S.since && S.since[r.n]) || S.loginAt;
    var since = sinceAt ? now - sinceAt : null;
    var right = r.out ? "logged out" : (glow ? "logged in" : (since !== null ? forTxt(since) : ""));
    html += '<div style="display:flex;align-items:baseline;gap:8px;border-bottom:1px dotted ' + RULE + ';padding:2px 0;' + (r.out ? 'opacity:0.6;' : '') + '">';
    html += '<span title="' + esc(g2) + '" style="flex:1 1 auto;white-space:nowrap;font-family:' + SERIF + ';font-size:12px;cursor:default;' + nameStyle + '">' + esc(cap(r.n)) + '</span>';
    // Integration columns go here, between the name and the time: standing
    // (#196), then ledger (#197).
    html += standCell(r.n);
    html += '<span style="min-width:5.5em;text-align:right;color:' + (r.out ? MUTED : (glow ? col : MUTED)) + ';white-space:nowrap;">' + right + '</span>';
    html += '</div>';
  }
  html += '</div>';
}
// OFFLINE: watched people not online (nor just left), last seen most recent
// first, never seen last. A click on the heading folds or unfolds it until
// the page reloads; SOCIAL OFFLINE ON/OFF sets it for good.
if (watchedN && S.prev !== null) {
  var off = [];
  for (var n3 in grp) {
    if (grp.hasOwnProperty(n3) && !on[n3] && !(fl[n3] && fl[n3].kind === "out")) off.push({ n: n3, seen: (S.seen && S.seen[n3]) || 0 });
  }
  off.sort(function (a, b) { return (b.seen - a.seen) || (a.n < b.n ? -1 : (a.n > b.n ? 1 : 0)); });
  if (off.length) {
    // The fold isn't in this HTML at all: a class on the page body
    // (loom-ofl-fold) hides the list and turns the arrow, through a style
    // set up once below. The click toggles that class; redraws never touch
    // it, so they can't undo it or flicker. SOCIAL OFFLINE ON/OFF and a page
    // load set it from the saved setting.
    html += '<div onclick="document.body.classList.toggle(\'loom-ofl-fold\')" style="cursor:pointer;margin-top:9px;border-top:1px solid ' + RULE + ';padding-top:5px;font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;font-size:11px;color:' + DEEP + ';"><span class="loom-ofl-arrow"></span>offline <span style="color:' + MUTED + ';">' + off.length + '</span></div>';
    html += '<div class="loom-ofl-list">';
    for (var oi = 0; oi < off.length; oi++) {
      var o = off[oi];
      html += '<div style="display:flex;align-items:baseline;gap:8px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;opacity:0.55;">';
      html += '<span title="' + esc(grp[o.n]) + '" style="flex:1 1 auto;white-space:nowrap;font-family:' + SERIF + ';font-size:11px;cursor:default;color:' + nameCol(o.n, grp[o.n]) + ';">' + esc(cap(o.n)) + '</span>';
      html += standCell(o.n);
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
// The page style: the fold, and the panel filling the tab however few rows it
// has (the tab's own container takes the panel's ink, in case Nexus doesn't pass
// its height down). Its text is set on every draw, so a reimport's change shows
// without a page reload; the body class starts from the setting the first time.
try {
  var oflSt = document.getElementById("loom-ofl-style");
  if (!oflSt) {
    oflSt = document.createElement("style");
    oflSt.id = "loom-ofl-style";
    document.head.appendChild(oflSt);
    document.body.classList.toggle("loom-ofl-fold", S.showOffline === false);
  }
  var oflCss = 'body.loom-ofl-fold .loom-ofl-list { display: none; } .loom-ofl-arrow::before { content: "\\25BE  "; } body.loom-ofl-fold .loom-ofl-arrow::before { content: "\\25B8  "; }' +
    ' .flexlayout__tab:has(#loom-online) { background: #0f1312 !important; } .flexlayout__tab:has(#loom-online) > * { min-height: 100%; }';
  if (oflSt.textContent !== oflCss) oflSt.textContent = oflCss;
} catch (e) {}
try { set_custom_tab_html("Online", html); } catch (e) {}
