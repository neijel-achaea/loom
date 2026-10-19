// comms_render -- the Comms tab (#157): channel traffic from GMCP, in the
// game's own colours, newest at the bottom.
//   - a row of filters: All, Tells, Say, Party, then every other channel in
//     the order first heard, each with its unread count; muted ones dimmed;
//     every clan channel under one Clans filter (a line's tag opens one clan)
//   - All: every channel that isn't muted, each line tagged with its channel
//     (a click on the tag opens that channel)
//   - Tells: the people you've been telling, newest first; a click opens the
//     conversation, both sides
//   - lines that name you marked (your own lines as they come: dimming them
//     made them hard to read, Ricardo)
//   - a click on a talker's name puts "t <name> " in the input line
//   - with social and loom installed (link social-comms, #160), talkers and
//     the people in Tells in their highlight colours
//   - with standings too (link standings-comms, #161), your standing with
//     them on hover (icon, band, score); the hover shows nothing else
// Clicks go through window.loomComms (comms_setup): the tab's page can't
// reach client. House style shared with Stats, Online, Here: ink panel,
// serif small-caps headings, monospace rows. The accent is a soft violet.
var C = client.loom.comms;
// Tab theme (#310): loom's city palette when one is on, else this tab's own colours.
var TH = (client.loom && client.loom.theme) || {};
var ACC = TH.acc || "#b9a4e6";
// The accent, see-through: mention rows and hovered conversations.
function ACCA(a) { var h = ACC.replace("#", ""); return "rgba(" + parseInt(h.slice(0, 2), 16) + "," + parseInt(h.slice(2, 4), 16) + "," + parseInt(h.slice(4, 6), 16) + "," + a + ")"; }
var TXT = TH.txt || "#e6e2ec";
var MUTED = TH.muted || "#8c8796";
var DIM = TH.dim || "#5f5a68";
var RULE = TH.rule || "#26222e";
var INK = TH.bg || "#121016";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
// The lines themselves in a plain sans: the serif was hard to read at chat
// size (Ricardo). Only this tab; the heading keeps the house serif.
var SANS = "'Segoe UI','Noto Sans','Helvetica Neue',Arial,sans-serif";
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
// Through loom's display entry point (#159): a person's highlight colour and
// group from social (#160), when the link is on; otherwise nothing.
var LL = client.loom.loom;
function ask(q, n) { return (LL && LL.answer) ? LL.answer("comms", q, n) : undefined; }
// The newbie leaf (#242, from room through loom): a small green leaf after
// the name of someone last seen with a newbie title; the title on hover.
function leaf(title) { return '<span title="newbie (' + esc(title) + ')" style="margin-left:4px;cursor:default;"><svg width="10" height="10" viewBox="0 0 10 10" style="vertical-align:-1px;" xmlns="http://www.w3.org/2000/svg"><path d="M1.2 8.8C1.2 4.2 3.8 1.2 8.8 1.2C8.8 6.2 5.8 8.8 1.2 8.8Z" fill="#8fd694"/><path d="M1.6 8.4L6.2 3.8" stroke="#2f5532" stroke-width="0.9"/></svg></span>'; }
// What to say on hover about a person: your standing with them (#161, from
// standings: icon, band, score); "" when nothing is known. Not "t Name" (the
// click is clear) nor the social group (the colour shows it): Ricardo, so
// the hover has room for what the eye can't see.
function about(n) {
  var bits = [];
  var st = ask("person.standing", n);
  if (st) bits.push((st.icon ? st.icon + "\ufe0e " : "") + st.band + " " + (st.score > 0 ? "+" : "") + (Math.round(st.score * 10) / 10).toFixed(1));
  return bits.join(" \u00b7 ");
}
// A line's text: its segments in their colours, the talker's name clickable
// (and in their highlight colour, when social knows them).
function body(l) {
  var out = "";
  var who = (!l.me && /^[A-Za-z]+$/.test(l.talker || "")) ? l.talker : "";
  var whoRe = who ? new RegExp("\\b" + who + "\\b") : null;
  for (var i = 0; i < l.segs.length; i++) {
    var tx = l.segs[i][0];
    var st = l.segs[i][1] ? ' style="color:' + l.segs[i][1] + ';"' : '';
    var m = whoRe ? whoRe.exec(tx) : null;
    if (m) {
      var wCol = ask("person.colour", who);
      var wAbout = about(who);
      out += '<span' + st + '>' + esc(tx.slice(0, m.index)) +
        '<span class="loom-cm-who"' + (wAbout ? ' title="' + esc(wAbout) + '"' : '') + (wCol ? ' style="color:' + esc(wCol) + ';"' : '') + ' onclick="window.loomComms&&window.loomComms.tell(\'' + who + '\')">' + who + '</span>' + (ask("person.newbie", who) ? leaf(ask("person.newbie", who)) : '') +
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
// One line. Its time is on hover, and in All and Clans the channel's tag
// starts the line, small, in the line's colour, with the text wrapping under
// it at full width (Ricardo, 2026-10-19: the time and tag columns took room
// the text needs on a narrow tab). A click on the tag opens that channel.
function lineRow(l, tag) {
  var bg = l.mention ? 'background:' + ACCA("0.10") + ';border-left:2px solid ' + ACC + ';padding-left:4px;' : 'border-left:2px solid transparent;padding-left:4px;';
  var t = "";
  if (tag) {
    var tk = l.ch;
    var tn = l.conv ? l.conv : C.name(tk);
    var tv = l.conv ? "tell:" + l.conv.toLowerCase() : tk;
    t = '<span class="loom-cm-tag" title="' + esc(C.name(tk)) + '" onclick="window.loomComms&&window.loomComms.view(\'' + esc(tv).replace(/'/g, "") + '\')" style="font-family:' + MONO + ';font-size:10px;margin-right:6px;' +
      'color:' + firstCol(l) + ';opacity:0.8;">' + esc(tn.length > 14 ? tn.slice(0, 13) + "…" : tn) + '</span>';
  }
  return '<div title="' + esc(hms(l.t)) + '" style="padding:1px 0;font-family:' + SANS + ';font-size:13px;line-height:1.4;' + bg + '">' + t + body(l) + '</div>';
}

// The filters: All, Tells, Say, Party, then the rest as first heard; every
// clan channel under one Clans filter, where the first clan was heard.
var keys = [];
for (var k in C.chans) { if (C.chans.hasOwnProperty(k)) keys.push(k); }
var clans = [];
var pin = { tells: 1, says: 2, party: 3 };
keys.sort(function (a, b) { return (pin[a] || 9) - (pin[b] || 9) || C.chans[a].first - C.chans[b].first; });
for (var kq = 0; kq < keys.length; kq++) { if (C.isClan(keys[kq])) clans.push(keys[kq]); }
var clanUnread = 0;
for (var kr = 0; kr < clans.length; kr++) { if (!C.muted[clans[kr]]) clanUnread += C.chans[clans[kr]].unread; }
var inClans = C.view === "clans" || (C.chans[C.view] && C.isClan(C.view));
var tellUnread = 0;
for (var cv in C.convs) { if (C.convs.hasOwnProperty(cv)) tellUnread += C.convs[cv].unread; }
if (C.view !== "all" && C.view !== "tells" && C.view.indexOf("tell:") !== 0 && !C.chans[C.view] && !(C.view === "clans" && clans.length)) C.view = "all";
if (C.view.indexOf("tell:") === 0 && !C.convs[C.view.slice(5)]) C.view = "tells";
var allUnread = 0;
for (var ku = 0; ku < keys.length; ku++) { if (!C.muted[keys[ku]]) allUnread += keys[ku] === "tells" ? tellUnread : C.chans[keys[ku]].unread; }
// The chips' keys in order (a click passes its index): clans as one, "clans".
C.chips = ["all"];
var clanChip = false;
for (var kc2 = 0; kc2 < keys.length; kc2++) {
  if (C.isClan(keys[kc2])) { if (!clanChip) { clanChip = true; C.chips.push("clans"); } }
  else C.chips.push(keys[kc2]);
}
function chip(i, label, n, on, muted) {
  return '<span class="loom-cm-chip" onclick="window.loomComms&&window.loomComms.chip(' + i + ')" title="' + esc(label) + (muted ? ' (muted)' : '') + '" style="color:' + (on ? ACC : (muted ? DIM : MUTED)) + ';border-bottom:1px solid ' + (on ? ACC : 'transparent') + ';' + (muted ? 'text-decoration:line-through;' : '') + '">' + esc(label.length > 16 ? label.slice(0, 15) + "…" : label) + badge(n) + '</span>';
}
var inTells = C.view === "tells" || C.view.indexOf("tell:") === 0;
var html = '<div id="loom-comms" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + INK + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;">';
// The header (title, mute link, filters, and a conversation's own line) stays
// put at the top of the tab while the lines scroll under it (Ricardo).
html += '<div style="position:sticky;top:0;z-index:2;background:' + INK + ';margin:-7px -8px 0;padding:7px 8px 0;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DIM + ';padding-bottom:3px;">';
html += '<span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:2px;font-size:15px;color:' + ACC + ';">Comms</span>';
if (C.chans[C.view] && C.view !== "all") {
  html += '<span class="loom-cm-chip" onclick="window.loomComms&&window.loomComms.mute()" style="color:' + (C.muted[C.view] ? ACC : MUTED) + ';">' + (C.muted[C.view] ? 'unmute ' : 'mute ') + esc(C.name(C.view)) + '</span>';
}
html += '</div>';
html += '<div style="display:flex;flex-wrap:wrap;gap:4px 10px;margin:5px 0 4px;">';
html += chip(0, "All", allUnread, C.view === "all", false);
for (var ci = 1; ci < C.chips.length; ci++) {
  var ck = C.chips[ci];
  if (ck === "clans") { html += chip(ci, "Clans", clanUnread, inClans, false); continue; }
  html += chip(ci, C.name(ck), C.muted[ck] ? 0 : (ck === "tells" ? tellUnread : C.chans[ck].unread), C.view === ck || (ck === "tells" && inTells), !!C.muted[ck]);
}
html += '</div>';
if (C.view.indexOf("tell:") === 0) {
  var hw = C.convs[C.view.slice(5)];
  var hwCol = ask("person.colour", hw.name);
  var hwAbout = about(hw.name);
  html += '<div style="border-top:1px solid ' + RULE + ';padding:3px 0;"><span class="loom-cm-chip" onclick="window.loomComms&&window.loomComms.view(\'tells\')" style="color:' + MUTED + ';">&larr; tells</span> <span' + (hwAbout ? ' title="' + esc(hwAbout) + '"' : '') + ' style="font-family:' + SANS + ';font-size:13px;color:' + esc(hwCol || ACC) + ';">&middot; ' + esc(hw.name) + (ask("person.newbie", hw.name) ? leaf(ask("person.newbie", hw.name)) : '') + '</span>' +
    ' <span class="loom-cm-who" onclick="window.loomComms&&window.loomComms.tell(\'' + hw.name.replace(/[^A-Za-z]/g, "") + '\')" style="color:' + MUTED + ';">(reply)</span></div>';
}
if (C.chans[C.view] && C.isClan(C.view)) {
  html += '<div style="border-top:1px solid ' + RULE + ';padding:3px 0;"><span class="loom-cm-chip" onclick="window.loomComms&&window.loomComms.view(\'clans\')" style="color:' + MUTED + ';">&larr; clans</span> <span style="font-family:' + SANS + ';font-size:13px;color:' + ACC + ';">&middot; ' + esc(C.name(C.view)) + '</span></div>';
}
html += '<div style="border-bottom:1px solid ' + RULE + ';"></div></div><div style="padding-top:4px;">';

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
    // In their highlight colour when social knows them (the unread badge
    // still says what's new); otherwise accent when unread, as before.
    var ccCol = ask("person.colour", cc.name);
    var ccAbout = about(cc.name);
    html += '<span' + (ccAbout ? ' title="' + esc(ccAbout) + '"' : '') + ' style="flex:none;width:7em;font-family:' + SANS + ';font-size:13px;color:' + esc(ccCol || (cc.unread ? ACC : TXT)) + ';">' + esc(cc.name) + (ask("person.newbie", cc.name) ? leaf(ask("person.newbie", cc.name)) : '') + badge(cc.unread) + '</span>';
    html += '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:' + SANS + ';font-size:12px;color:' + MUTED + ';">' + esc(prev) + '</span>';
    html += '<span style="flex:none;color:' + DIM + ';">' + (cc.last ? ago(cc.last) : '') + '</span></div>';
  }
} else {
  var rows = [];
  var tag = false;
  if (C.view === "all" || C.view === "clans") {
    tag = true;
    for (var ak = 0; ak < keys.length; ak++) {
      if (C.muted[keys[ak]]) continue;
      if (C.view === "clans" && !C.isClan(keys[ak])) continue;
      var al = C.chans[keys[ak]].lines;
      for (var ai = Math.max(0, al.length - 200); ai < al.length; ai++) rows.push(al[ai]);
    }
    rows.sort(function (a, b) { return a.s - b.s; });
    if (rows.length > 200) rows = rows.slice(rows.length - 200);
  } else if (C.view.indexOf("tell:") === 0) {
    var who = C.convs[C.view.slice(5)];
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
    ' .loom-cm-conv:hover { background: ' + ACCA("0.06") + '; } .loom-cm-who { text-decoration: underline dotted rgba(255,255,255,0.35); text-underline-offset: 2px; } .loom-cm-who:hover { text-decoration-color: currentColor; }';
  if (cmSt.textContent !== cmCss) cmSt.textContent = cmCss;
} catch (e) {}

// Newest at the bottom (#273). C.follow says whether you're following the
// newest lines: on by default, off only when you scroll up yourself, on again
// at the bottom or when the view changes. The scroller (the first parent that
// scrolls) gets, once, a scroll listener that keeps C.follow and a
// ResizeObserver that goes back to the bottom whenever the tab gets its size:
// after a reload the tab is drawn while hidden or unsized, so a jump made at
// draw time alone was lost and the tab stayed at the top.
if (C.follow === undefined) C.follow = true;
if (C.jump) C.follow = true;
C.jump = false;
try { set_custom_tab_html(C.tab, html); } catch (e) {}
setTimeout(function () {
  try {
    var el = document.getElementById("loom-comms");
    var sc = null;
    for (var p = el ? el.parentElement : null; p; p = p.parentElement) {
      if (/auto|scroll/.test(getComputedStyle(p).overflowY)) { sc = p; break; }
    }
    if (!sc) return;
    if (!sc.loomCommsFollow) {
      sc.loomCommsFollow = true;
      sc.addEventListener("scroll", function () {
        if (sc.clientHeight > 0) C.follow = sc.scrollHeight - sc.scrollTop - sc.clientHeight < 40;
      });
      if (window.ResizeObserver) new ResizeObserver(function () { if (C.follow) sc.scrollTop = sc.scrollHeight; }).observe(sc);
    }
    if (C.follow) sc.scrollTop = sc.scrollHeight;
  } catch (e) {}
}, 20);
