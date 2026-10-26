// questbook_render -- the Quests tab (#376), in the house style shared with Here
// and Waypoints: ink panel, serif small-caps headings, monospace rows.
// Two views (mockup boards 1 and 2):
//   - the list, by area (the area you're in first; areas fold, remembered):
//     two lines a quest, its name and a status chip (STEP 3 OF 7, READY,
//     AGAIN IN 5 H), then its rewards, repeat and record; filters All ·
//     Ready · Waiting; ● RECORD NEW (recording is #376's next step);
//   - one quest: rewards, a progress bar, its steps two lines each with the
//     current one highlighted and its button (WALK, the line to send, DONE),
//     START OVER and EDIT STEPS, when it was last done.
if (!client.loom || !client.loom.questbook || !client.loom.questbook.list) run_function("questbook_setup", [], "questbook");
var QU = client.loom.questbook;
var TH = (client.loom && client.loom.theme) || {};
var AMBER = TH.acc || "#e0b46c";
var DEEP = TH.deep || "#7a5f33";
var TXT = TH.txt || "#e8e2d6";
var MUTED = TH.muted || "#8f877a";
var DIM = TH.dim || "#6d665b";
var RULE = TH.rule || "#2b2620";
var BG = TH.bg || "#13110e";
var HI = TH.hi || "#f0cc8c";
var TRACK = TH.track || "#2b2620";
var GREEN = "#8fd694";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
var SYM = "'Segoe UI Symbol','DejaVu Sans',sans-serif";
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function js(s) { return esc(String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'")); }
function click(fn) { return 'window.loomQuestbook&&window.loomQuestbook.' + fn; }
function chip(label, fn, col, border, tip, bg) {
  return '<span onclick="event.stopPropagation();' + click(fn) + '" title="' + esc(tip) + '" style="flex:none;cursor:pointer;padding:0 5px;border:1px solid ' + border + ';color:' + col + ';' + (bg ? 'background:' + bg + ';' : '') + 'letter-spacing:0.08em;white-space:nowrap;">' + label + '</span>';
}
function tag(label, col, border) {
  return '<span style="flex:none;padding:0 5px;border:1px solid ' + border + ';color:' + col + ';letter-spacing:0.08em;white-space:nowrap;">' + label + '</span>';
}
var here = QU.here || {};
var open = QU.open ? QU.byId(QU.open) : null;
var html = '<div id="loom-quests" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;display:flex;flex-direction:column;">';

function statusChip(q) {
  var s = QU.status(q), st = QU.state[q.id] || {};
  if (s === "going") return tag('STEP ' + ((st.step || 0) + 1) + ' OF ' + q.steps.length, HI, AMBER);
  if (s === "ready") return tag('READY', GREEN, GREEN);
  return tag('<span style="font-family:' + SYM + ';">&#10003;</span> AGAIN IN ' + QU.span(QU.readyAt(q) - Date.now()), DIM, RULE);
}
function record(q) {
  var st = QU.state[q.id] || {};
  return st.done ? 'done ' + QU.times(st.done) : 'not done yet';
}

if (!open) {
  // --- The list, by area ---------------------------------------------------
  var counts = { going: 0, ready: 0, waiting: 0 };
  var groups = {}, order = [];
  for (var i = 0; i < QU.list.length; i++) {
    var qi = QU.list[i], si = QU.status(qi);
    counts[si]++;
    var a = qi.area || "unknown area";
    if (!groups[a]) { groups[a] = []; order.push(a); }
    groups[a].push(qi);
  }
  order.sort(function (x, y) {
    if (x === here.area) return -1; if (y === here.area) return 1;
    return x.toLowerCase() < y.toLowerCase() ? -1 : (x.toLowerCase() > y.toLowerCase() ? 1 : 0);
  });
  // In an area: under way first, then ready, then waiting (soonest first),
  // each by name.
  var rank = { going: 0, ready: 1, waiting: 2 };
  for (var so = 0; so < order.length; so++) groups[order[so]].sort(function (x, y) {
    var a2 = QU.status(x), b2 = QU.status(y);
    if (a2 !== b2) return rank[a2] - rank[b2];
    if (a2 === "waiting") return QU.readyAt(x) - QU.readyAt(y);
    return x.name.toLowerCase() < y.name.toLowerCase() ? -1 : 1;
  });
  QU.areasDrawn = order.slice();

  var head = QU.list.length + (QU.list.length === 1 ? ' quest' : ' quests') + (QU.list.length ? ' &middot; ' + (counts.ready + counts.going) + ' ready &middot; ' + order.length + (order.length === 1 ? ' area' : ' areas') : '');
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
  html += '<span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:2px;font-size:15px;color:' + AMBER + ';">Quests</span>';
  html += '<span style="color:' + MUTED + ';">' + head + '</span></div>';

  // Filters and RECORD NEW.
  function seg(v, lbl) {
    var on = QU.filter === v;
    return '<span onclick="' + click("filter('" + v + "')") + '" title="show ' + (v === "all" ? "every quest" : v) + '" style="cursor:pointer;padding:0 4px;' + (on ? 'background:' + DEEP + ';color:' + TXT + ';' : 'color:' + MUTED + ';') + '">' + lbl + '</span>';
  }
  html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:5px;">';
  html += '<span style="display:flex;align-items:baseline;gap:6px;"><span style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">show</span>';
  html += '<span style="border:1px solid ' + DEEP + ';letter-spacing:0.08em;white-space:nowrap;font-size:9px;">' + seg("all", "ALL") + seg("ready", "READY") + seg("waiting", "WAITING") + '</span></span>';
  html += chip('<span style="font-family:' + SYM + ';color:#ff6a5e;">&#9679;</span> RECORD NEW', 'record()', MUTED, DEEP, 'record a new quest as you play (coming next; for now QUESTBOOK NEW <name>)');
  html += '</div>';

  function shown(q) {
    var s = QU.status(q);
    if (QU.filter === "ready") return s !== "waiting";
    if (QU.filter === "waiting") return s === "waiting";
    return true;
  }
  var any = false;
  for (var g = 0; g < order.length; g++) {
    var area = order[g], qs = groups[area], folded = !!QU.folded[area], vis = [];
    for (var v = 0; v < qs.length; v++) if (shown(qs[v])) vis.push(qs[v]);
    if (!vis.length) continue;
    any = true;
    var sub = "";
    if (folded) {
      var nr = 0, nw = 0;
      for (var c = 0; c < vis.length; c++) { if (QU.status(vis[c]) === "waiting") nw++; else nr++; }
      var parts = [];
      if (nr) parts.push(nr + ' ready');
      if (nw) parts.push(nw + ' waiting');
      sub = ' <span style="color:' + DIM + ';font-variant:normal;letter-spacing:0;font-style:italic;">&middot; ' + parts.join(', ') + '</span>';
    }
    html += '<div onclick="' + click('fold(' + g + ')') + '" title="click to ' + (folded ? 'unfold' : 'fold') + '" style="cursor:pointer;font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;font-size:11px;color:' + AMBER + ';margin:8px 0 2px;border-top:1px solid ' + RULE + ';padding-top:5px;">';
    html += '<span style="font-family:' + SYM + ';display:inline-block;width:12px;color:' + MUTED + ';">' + (folded ? '&#9656;' : '&#9662;') + '</span>' + esc(area.toLowerCase()) + ' <span style="color:' + MUTED + ';">' + vis.length + '</span>' + sub + '</div>';
    if (folded) continue;
    for (var k = 0; k < vis.length; k++) {
      var q = vis[k], s = QU.status(q), waiting = s === "waiting", going = s === "going";
      html += '<div onclick="' + click("open('" + js(q.id) + "')") + '" title="open ' + esc(q.name) + '" style="cursor:pointer;padding:3px 4px;border-bottom:1px dotted ' + RULE + ';' + (going ? 'background:rgba(224,180,108,0.08);' : '') + '">';
      html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">';
      html += '<span style="min-width:0;font-family:' + SERIF + ';font-size:14px;color:' + (waiting ? MUTED : (going ? HI : TXT)) + ';">' + esc(q.name) + '</span>' + statusChip(q) + '</div>';
      var line2 = QU.rewardText(q).concat([q.repeat, record(q)]);
      html += '<div style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + (waiting ? DIM : MUTED) + ';">' + line2.map(esc).join(' &middot; ') + '</div>';
      html += '</div>';
    }
  }
  if (!QU.list.length) html += '<div style="margin-top:8px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">No quests yet. QUESTBOOK NEW &lt;name&gt; starts writing one down.</div>';
  else if (!any) html += '<div style="margin-top:8px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">No ' + (QU.filter === "ready" ? 'quest is ready' : 'quest is waiting') + ' right now.</div>';
  html += '<div style="margin-top:auto;padding-top:6px;font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">Click a quest to follow it; click a heading to fold it. Daily quests reset at ' + esc(QU.daily) + '.</div>';
} else {
  // --- One quest, following it ---------------------------------------------
  var q1 = open, st = QU.state[q1.id] || { step: 0, kills: 0, last: 0, done: 0 };
  var s1 = QU.status(q1), following = QU.follow === q1.id;
  var cur = Math.min(st.step || 0, q1.steps.length);
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
  html += '<span onclick="' + click("open('')") + '" title="back to every quest" style="cursor:pointer;font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:2px;font-size:13px;color:' + AMBER + ';"><span style="font-family:' + SYM + ';">&#8592;</span> quests</span>';
  html += '<span style="color:' + MUTED + ';">' + esc([q1.area, q1.repeat].filter(function (x) { return x; }).join(' · ')) + '</span></div>';
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-top:5px;">';
  html += '<span style="min-width:0;font-family:' + SERIF + ';font-size:16px;color:' + TXT + ';">' + esc(q1.name) + '</span>' + statusChip(q1) + '</div>';
  var rw = QU.rewardText(q1);
  html += '<div style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">' + (rw.length ? rw.map(esc).join(' &middot; ') : 'no rewards written down (QUESTBOOK REWARD)') + '</div>';

  // Progress.
  var n = q1.steps.length, pct = n ? Math.round(100 * cur / n) : 0;
  html += '<div style="display:flex;align-items:center;gap:8px;margin:6px 0 4px;">';
  html += '<div style="flex:1 1 auto;height:6px;background:' + TRACK + ';border:1px solid ' + RULE + ';"><div style="height:100%;width:' + pct + '%;background:' + AMBER + ';"></div></div>';
  html += '<span style="flex:none;color:' + MUTED + ';">' + cur + ' of ' + n + ' done</span></div>';
  if (s1 === "waiting" && !following) {
    html += '<div style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + DIM + ';margin-bottom:2px;">Done for now: ready again in ' + QU.span(QU.readyAt(q1) - Date.now()).toLowerCase() + '. START OVER follows it anyway.</div>';
  } else if (!following && n) {
    var other = QU.followed();
    html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:2px;"><span style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">' + (other ? 'You\'re following ' + esc(other.name) + '.' : 'Not followed: its steps don\'t tick yet.') + '</span>' + chip('FOLLOW THIS', 'follow()', AMBER, AMBER, 'tick this quest\'s steps as you play') + '</div>';
  }

  // Steps.
  var KIND = { go: "GO", talk: "TALK", ask: "ASK", say: "SAY", get: "GET", buy: "BUY", give: "GIVE", kill: "KILL", note: "NOTE" };
  for (var j = 0; j < n; j++) {
    var sp = q1.steps[j], done = j < cur, isCur = j === cur && following && s1 !== "waiting", struck = QU.edit && QU.struck[j];
    var mark = done ? '<span style="font-family:' + SYM + ';color:' + GREEN + ';">&#10003;</span>' : (isCur ? '<span style="font-family:' + SYM + ';color:' + AMBER + ';">&#9654;</span>' : String(j + 1));
    var what = QU.stepWhat(sp), d2 = "", btn = "";
    if (sp.k === "go") {
      var wpt = QU.waypoint(sp.room);
      d2 = esc(sp.room) + ' &middot; ' + (wpt ? '<span style="font-family:' + SYM + ';color:' + AMBER + ';">&#9873;</span> ' + esc(wpt.name) : esc(sp.area || "")) + (here.id === sp.room ? ' &middot; you\'re here' : '');
      if (isCur && here.id !== sp.room) btn = chip('WALK', 'act()', AMBER, AMBER, 'walk there (PATH FIND ' + sp.room + ')');
    } else if (sp.k === "talk" || sp.k === "ask" || sp.k === "say") {
      d2 = 'ticks when you send it from here';
      if (isCur) btn = chip('SEND', 'act()', AMBER, AMBER, 'send: ' + sp.cmd);
    } else if (sp.k === "get" || sp.k === "buy") {
      d2 = (sp.cmd ? esc(sp.cmd) + ' &middot; ' : '') + 'ticks when it\'s in your inventory';
      if (isCur) btn = sp.cmd ? chip('SEND', 'act()', AMBER, AMBER, 'send: ' + sp.cmd) : chip('DONE', 'act()', MUTED, DEEP, 'tick it by hand');
    } else if (sp.k === "give") {
      d2 = (sp.cmd ? esc(sp.cmd) + ' &middot; ' : '') + 'ticks when it leaves your inventory';
      if (isCur) btn = sp.cmd ? chip('SEND', 'act()', AMBER, AMBER, 'send: ' + sp.cmd) : chip('DONE', 'act()', MUTED, DEEP, 'tick it by hand');
    } else if (sp.k === "kill") {
      d2 = isCur ? (st.kills || 0) + ' of ' + sp.n + ' killed' : 'ticks after ' + sp.n + (sp.n === 1 ? ' kill' : ' kills');
      if (isCur) btn = chip('DONE', 'act()', MUTED, DEEP, 'tick it by hand');
    } else {
      d2 = 'tick it by hand';
      if (isCur) btn = chip('DONE', 'act()', MUTED, DEEP, 'tick it by hand');
    }
    // Done steps keep their details, not what would tick them.
    if (done && (sp.k === "talk" || sp.k === "ask" || sp.k === "say")) d2 = "sent";
    else if (done && sp.k !== "go" && sp.k !== "kill") d2 = sp.cmd ? esc(sp.cmd) : "";
    else if (done && sp.k === "kill") d2 = sp.n + (sp.n === 1 ? ' kill' : ' kills');
    if (QU.edit) btn = '<span onclick="event.stopPropagation();' + click('strike(' + j + ')') + '" title="' + (struck ? 'keep this step' : 'drop this step') + '" style="flex:none;cursor:pointer;color:' + (struck ? MUTED : '#ff9a4c') + ';padding:0 4px;display:inline-block;text-decoration:none;">' + (struck ? 'keep' : '&times;') + '</span>';
    var rowTip = QU.edit ? '' : 'make this the current step';
    html += '<div' + (QU.edit ? '' : ' onclick="' + click('jump(' + j + ')') + '"') + ' title="' + rowTip + '" style="' + (QU.edit ? '' : 'cursor:pointer;') + 'padding:3px 4px;border-bottom:1px dotted ' + RULE + ';' + (isCur ? 'background:rgba(224,180,108,0.10);border-left:2px solid ' + AMBER + ';' : 'border-left:2px solid transparent;') + (struck ? 'text-decoration:line-through;opacity:0.5;' : '') + '">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">';
    html += '<span style="min-width:0;display:flex;align-items:baseline;gap:6px;"><span style="flex:none;width:12px;text-align:right;color:' + (done ? GREEN : (isCur ? AMBER : MUTED)) + ';">' + mark + '</span>';
    html += '<span style="flex:none;width:30px;color:' + (isCur ? AMBER : (done ? DIM : MUTED)) + ';letter-spacing:0.06em;">' + KIND[sp.k] + '</span>';
    html += '<span style="min-width:0;font-family:' + SERIF + ';font-size:13px;color:' + (done ? MUTED : (isCur ? HI : TXT)) + ';">' + esc(what) + '</span></span>' + btn + '</div>';
    html += '<div style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + (done ? DIM : MUTED) + ';padding-left:54px;">' + d2 + '</div>';
    html += '</div>';
  }
  if (!n) html += '<div style="margin-top:6px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">No steps yet. QUESTBOOK STEP GO saves the room you\'re in; QUESTBOOK HELP lists the other kinds.</div>';
  if (QU.edit) html += '<div style="margin-top:5px;font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">&times; strikes a step through; DONE EDITING drops the struck ones. Add steps with QUESTBOOK STEP &hellip;</div>';

  // Footer.
  html += '<div style="margin-top:auto;padding-top:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">';
  html += '<span style="display:flex;gap:6px;">' + chip('START OVER', 'restart()', MUTED, DEEP, 'back to step 1, and follow this quest') + chip(QU.edit ? 'DONE EDITING' : 'EDIT STEPS', 'edit()', QU.edit ? AMBER : MUTED, QU.edit ? AMBER : DEEP, QU.edit ? 'drop the struck steps' : 'strike steps out') + '</span>';
  html += '<span style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">' + (st.last ? 'last done ' + QU.ago(st.last) + ' &middot; ' : '') + record(q1) + '</span></div>';
}
html += '</div>';

// The whole tab in the panel's colour (#355).
try {
  var quSt = document.getElementById("loom-quests-style");
  if (!quSt) { quSt = document.createElement("style"); quSt.id = "loom-quests-style"; document.head.appendChild(quSt); }
  var quCss = '.flexlayout__tab:has(#loom-quests) { background: ' + BG + ' !important; } .flexlayout__tab:has(#loom-quests) > * { min-height: 100%; }';
  if (quSt.textContent !== quCss) quSt.textContent = quCss;
} catch (e) {}
try { set_custom_tab_html("Quests", html); } catch (e) {}
