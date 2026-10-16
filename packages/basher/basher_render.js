// basher_render -- the Basher tab (#123): this area's priority list, in kill
// order with ▲▼ and an ACTIVE/IGNORED switch per mob type, then the ignored
// ones (new types marked NEW). Clicks go through window.loomBasher, set up in
// basher_setup (a tab page can't reach client.*).
var B = client.loom.basher;
var AMBER = "#e0b46c", DEEP = "#7a5f33", TXT = "#e8e2d6", MUTED = "#8f877a", DIM = "#6d665b", RULE = "#2b2620", GREEN = "#8fd694";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
function esc(t) { return String(t === undefined || t === null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function caps(t, n, c) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;font-size:11px;color:' + (c || AMBER) + ';margin:8px 0 2px;border-top:1px solid ' + RULE + ';padding-top:5px;">' + t + ' <span style="color:' + MUTED + ';">' + n + '</span></div>'; }
function btn(label, act, i, on) {
  return '<span ' + (on ? 'onclick="window.loomBasher&&window.loomBasher.act(\'' + act + '\',' + i + ')" ' : '') + 'style="flex:0 0 auto;border:1px solid #3a332a;background:#1c1915;color:' + (on ? "#c8bfae" : "#3a332a") + ';font-size:11px;width:20px;height:18px;line-height:16px;text-align:center;border-radius:3px;cursor:' + (on ? "pointer" : "default") + ';user-select:none;">' + label + '</span>';
}
function tog(i, on) {
  return '<span onclick="window.loomBasher&&window.loomBasher.act(\'toggle\',' + i + ')" title="click to ' + (on ? "ignore" : "make active") + '" style="flex:0 0 auto;font-size:10px;padding:1px 6px;border-radius:9px;border:1px solid ' + (on ? "#4e7a52" : "#3a332a") + ';color:' + (on ? GREEN : DIM) + ';' + (on ? "background:rgba(143,214,148,.08);" : "") + 'cursor:pointer;letter-spacing:.05em;user-select:none;">' + (on ? "ACTIVE" : "IGNORED") + '</span>';
}

// How many living mobs of each type are in this room.
var hereN = {};
for (var hi = 0; hi < B.order.length; hi++) {
  var hit = B.room[B.order[hi]];
  if (B.living(hit)) hereN[hit.name] = (hereN[hit.name] || 0) + 1;
}
var hereTag = function (n) { return hereN[n] ? '<span style="font-size:9px;color:' + GREEN + ';margin-left:5px;white-space:nowrap;">&#9679; ' + hereN[n] + ' here</span>' : ''; };

var state = !B.on ? "OFF" : (B.fleeing ? "FLEEING" : (B.run ? "RUNNING" : "PRIMED"));
var sc = { OFF: DIM, PRIMED: "#c8bfae", RUNNING: AMBER, FLEEING: "#ff9a4c" }[state];
var m = B.main();
var hu = B.hunting();
var h = to_number(get_variable("basher_flee_health")) || 0, mn = to_number(get_variable("basher_flee_mana")) || 0;
var flee = (h || mn) ? "flees under " + [h ? h + "% health" : "", mn ? mn + "% mana" : ""].filter(function (x) { return x; }).join(" / ") : "never flees";

var html = '<div id="loom-basher" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#13110e;border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
html += '<div style="font-family:' + SERIF + ';color:' + AMBER + ';font-size:15px;letter-spacing:0.06em;">Basher</div>';
html += '<span style="font-size:10px;letter-spacing:.08em;padding:0 5px;border:1px solid ' + (state === "OFF" ? RULE : DEEP) + ';color:' + sc + ';">' + state + (m && state !== "OFF" ? ' &middot; ' + esc(m.name.toUpperCase()) : '') + '</span></div>';
html += '<div style="font-family:' + SERIF + ';color:' + MUTED + ';font-size:11px;margin:4px 0 0;"><i>' + esc(B.area || "no area yet") + '</i> &nbsp;&middot;&nbsp; ' + flee + (hu ? ' &nbsp;&middot;&nbsp; rage ' + (to_number(hu.rage) || 0) : '') + (B.lastFight ? ' &nbsp;&middot;&nbsp; <span style="color:#ff9a4c;">last fight</span>' : '') + '</div>';

var l = B.list();
if (!B.area) {
  html += '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;margin-top:8px;">Waiting for the room… (move, or LOOK)</div>';
} else {
  var act = [], ign = [];
  for (var i = 0; i < l.length; i++) (l[i].on ? act : ign).push(i);
  html += caps("kill order", act.length);
  if (!act.length) html += '<div style="color:' + DIM + ';font-family:' + SERIF + ';font-style:italic;font-size:11px;padding:2px 0;">None yet: the basher follows your own target here. Make a mob ACTIVE below.</div>';
  for (var a = 0; a < act.length; a++) {
    var e = l[act[a]];
    html += '<div style="display:flex;align-items:center;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:3px 0;">' +
      '<span style="flex:0 0 1.8em;text-align:right;font-size:12px;color:' + AMBER + ';">' + (a + 1) + '</span>' +
      '<span style="flex:1 1 auto;font-size:13px;">' + esc(e.name) + hereTag(e.name) + '</span>' +
      btn("&#9650;", "up", act[a], a > 0) + btn("&#9660;", "down", act[a], a < act.length - 1) + tog(act[a], true) + '</div>';
  }
  html += caps("ignored", ign.length, DIM);
  for (var g = 0; g < ign.length; g++) {
    var f = l[ign[g]];
    html += '<div style="display:flex;align-items:center;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:3px 0;">' +
      '<span style="flex:0 0 1.8em;text-align:right;font-size:12px;color:' + DIM + ';">&ndash;</span>' +
      '<span style="flex:1 1 auto;font-size:13px;color:' + DIM + ';">' + esc(f.name) + (f.isNew ? '<span style="font-size:9px;color:#e6c25a;border:1px solid #7a6a33;padding:0 3px;margin-left:5px;">NEW</span>' : '') + hereTag(f.name) + '</span>' +
      tog(ign[g], false) + '</div>';
  }
  html += '<div style="color:' + DIM + ';font-size:10px;margin-top:6px;line-height:1.4;">New mob types join the ignored list as you meet them. Turn one ACTIVE to add it to the bottom of the kill order, then move it with &#9650;&#9660;.</div>';
}
html += '</div>';
try {
  if (!document.getElementById("loom-basher-style")) {
    var bsSt = document.createElement("style");
    bsSt.id = "loom-basher-style";
    bsSt.textContent = '.flexlayout__tab:has(#loom-basher) { background: #13110e !important; } .flexlayout__tab:has(#loom-basher) > * { min-height: 100%; }';
    document.head.appendChild(bsSt);
  }
} catch (e) {}
try { set_custom_tab_html("Basher", html); } catch (e) {}
