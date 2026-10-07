if (!client.dc) {
  client.dc = {};
  client.dc.gap = parseFloat(get_variable("dc_gap"));
  if (isNaN(client.dc.gap) || client.dc.gap <= 0) { client.dc.gap = 8; }
  client.dc.tab = "DmgChart";
  client.dc.colors = { "cutting": "#d9534f", "blunt": "#b08968", "magical": "#9b6bd6", "unblockable": "#d8d8d8", "poison": "#6abf4b", "fire": "#f0883e", "cold": "#5bc0de", "electricity": "#f2d43d", "asphyxiation": "#7f8fa6", "psychic": "#e36bb8", "raw": "#8c8c8c", "bleed": "#8b1e2d" };
  client.dc.spare = ["#4fb0a5", "#c9a0dc", "#a3c45a", "#e0b070", "#6f8fd8", "#d97a9a"];
  client.dc.spareIdx = 0;
  client.dc.fight = null;
  client.dc.lastInc = null;
  client.dc.ev = null;
  client.dc.view = "";
  client.dc.saved = [];
  try { var dcRaw = get_variable("dc_sessions"); if (dcRaw && String(dcRaw).length) { client.dc.saved = JSON.parse(dcRaw) || []; } } catch (dcErr1) { client.dc.saved = []; }
  client.dc.nextId = 1;
  for (var dcI = 0; dcI < client.dc.saved.length; dcI++) { if (client.dc.saved[dcI].id >= client.dc.nextId) { client.dc.nextId = client.dc.saved[dcI].id + 1; } }
  client.dc.sess = null;
  client.dc.sessSaved = 0;
  try { var dcOpen = get_variable("dc_open"); if (dcOpen && String(dcOpen).length) { client.dc.sess = JSON.parse(dcOpen); } } catch (dcErr2) { client.dc.sess = null; }
}
var sub = String(args[1] || "").toLowerCase();
var rest = args[2] ? String(args[2]).trim() : "";
var d = client.dc;
if (sub == "gap") {
  var g = parseFloat(rest);
  if (isNaN(g) || g <= 0) {
    display_notice("[dmgchart] usage: DMGCHART GAP <seconds>  (currently " + d.gap + "s)", "yellow");
  } else {
    d.gap = g;
    set_variable("dc_gap", String(g));
    display_notice("[dmgchart] fight gap set to " + g + "s", "cyan");
  }
} else if (sub == "reset") {
  d.fight = null;
  d.lastInc = null;
  display_notice("[dmgchart] fight cleared; the next damage line starts a new one", "cyan");
} else if (sub == "start") {
  if (d.sess) {
    display_notice("[dmgchart] session '" + d.sess.name + "' is already recording. DMGCHART END first.", "yellow");
  } else {
    d.sess = { name: rest || ("session " + d.nextId), start: Date.now(), lastT: 0, combatMs: 0, fights: 0, inc: {}, out: {}, incTotal: 0, outTotal: 0 };
    set_variable("dc_open", JSON.stringify(d.sess));
    d.sessSaved = Date.now();
    display_notice("[dmgchart] recording session '" + d.sess.name + "'. DMGCHART END to save it.", "cyan");
  }
} else if (sub == "end") {
  if (!d.sess) {
    display_notice("[dmgchart] no session is recording. DMGCHART START [name] to begin one.", "yellow");
  } else {
    var ss = d.sess;
    if (ss.fights == 0) {
      display_notice("[dmgchart] session '" + ss.name + "' had no damage; discarded.", "yellow");
    } else {
      var rec = { id: d.nextId, name: ss.name, start: ss.start, end: Date.now(), combatMs: ss.combatMs, fights: ss.fights, inc: ss.inc, out: ss.out, incTotal: ss.incTotal, outTotal: ss.outTotal, hits: ss.hits || null };
      d.nextId++;
      d.saved.push(rec);
      while (d.saved.length > 50) { d.saved.shift(); }
      set_variable("dc_sessions", JSON.stringify(d.saved));
      var cs = Math.max(1, rec.combatMs / 1000);
      display_notice("[dmgchart] saved session #" + rec.id + " '" + rec.name + "': " + rec.fights + " fights, " + Math.round(cs) + "s in combat, out " + Math.round(rec.outTotal / cs) + " dps, in " + Math.round(rec.incTotal / cs) + " dps", "cyan");
    }
    d.sess = null;
    set_variable("dc_open", "");
    if (d.view == "session") { d.view = ""; }
  }
} else if (sub == "show") {
  if (rest == "") {
    if (d.sess) { d.view = "session"; } else { display_notice("[dmgchart] no session recording. DMGCHART SHOW <#> for a saved one.", "yellow"); }
  } else {
    var found = false;
    for (var q = 0; q < d.saved.length; q++) { if (String(d.saved[q].id) == rest) { found = true; } }
    if (found) { d.view = rest; } else { display_notice("[dmgchart] no saved session #" + rest, "yellow"); }
  }
} else if (sub == "live") {
  d.view = "";
} else if (sub == "del") {
  var kept = [];
  for (var x = 0; x < d.saved.length; x++) { if (String(d.saved[x].id) != rest) { kept.push(d.saved[x]); } }
  if (kept.length == d.saved.length) {
    display_notice("[dmgchart] no saved session #" + rest, "yellow");
  } else {
    d.saved = kept;
    set_variable("dc_sessions", JSON.stringify(d.saved));
    if (String(d.view) == rest) { d.view = ""; }
    display_notice("[dmgchart] deleted session #" + rest, "cyan");
  }
} else if (sub == "wipe") {
  if (rest.toLowerCase() == "confirm") {
    d.saved = [];
    set_variable("dc_sessions", "[]");
    if (d.view != "session") { d.view = ""; }
    display_notice("[dmgchart] all saved sessions wiped", "red");
  } else {
    display_notice("[dmgchart] this deletes ALL saved sessions. DMGCHART WIPE CONFIRM to proceed.", "yellow");
  }
} else {
  display_notice("[dmgchart] gap " + d.gap + "s" + (d.sess ? ", recording '" + d.sess.name + "'" : "") + ", " + d.saved.length + " saved sessions.", "cyan");
  display_notice("[dmgchart] GAP <s> | RESET | START [name] | END | SHOW [#] | LIVE | DEL <#> | WIPE CONFIRM", "cyan");
}
run_function("dc_render", [], "dmgchart");
