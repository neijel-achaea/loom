if (!client.loom || !client.loom.dmgchart || !client.loom.dmgchart.saved) run_function("dmgchart_setup", [], "dmgchart");
// DMGCHART [subcommand ...]: the one command for this package.
var dcRaw = String(args[1] || "").trim();
var dcSp = dcRaw.search(/\s/);
var sub = (dcSp < 0 ? dcRaw : dcRaw.slice(0, dcSp)).toLowerCase();
var rest = dcSp < 0 ? "" : dcRaw.slice(dcSp + 1).trim();
var d = client.loom.dmgchart;
// Session numbers may be typed as 3 or #3.
var restId = rest.replace(/^#/, "");
if (sub == "show" || sub == "del") rest = restId;
if (sub == "gap") {
  var g = parseFloat(rest);
  if (isNaN(g) || g <= 0) {
    display_notice("[dmgchart] usage: DMGCHART GAP <seconds>  (currently " + d.gap + "s)", "yellow");
  } else {
    d.gap = g;
    set_variable("dmgchart_gap", String(g));
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
    set_variable("dmgchart_open", JSON.stringify(d.sess));
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
      set_variable("dmgchart_sessions", JSON.stringify(d.saved));
      var cs = Math.max(1, rec.combatMs / 1000);
      display_notice("[dmgchart] saved session #" + rec.id + " '" + rec.name + "': " + rec.fights + " fights, " + Math.round(cs) + "s in combat, out " + Math.round(rec.outTotal / cs) + " dps, in " + Math.round(rec.incTotal / cs) + " dps", "cyan");
    }
    d.sess = null;
    set_variable("dmgchart_open", "");
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
    set_variable("dmgchart_sessions", JSON.stringify(d.saved));
    if (String(d.view) == rest) { d.view = ""; }
    display_notice("[dmgchart] deleted session #" + rest, "cyan");
  }
} else if (sub == "wipe") {
  if (rest.toLowerCase() == "confirm") {
    d.saved = [];
    set_variable("dmgchart_sessions", "[]");
    if (d.view != "session") { d.view = ""; }
    display_notice("[dmgchart] all saved sessions wiped", "red");
  } else {
    display_notice("[dmgchart] this deletes ALL saved sessions. DMGCHART WIPE CONFIRM to proceed.", "yellow");
  }
} else if (sub == "" || sub == "status") {
  var dcF = d.fight;
  var dcLine = "gap " + d.gap + "s, " + d.saved.length + " saved session" + (d.saved.length == 1 ? "" : "s");
  if (d.sess) dcLine += ", recording '" + d.sess.name + "' (" + d.sess.fights + " fights so far)";
  display_notice("[dmgchart] " + dcLine + ".", "cyan");
  if (dcF) {
    var dcDur = Math.max(1, (dcF.last - dcF.start) / 1000);
    var dcAgo = Math.round((Date.now() - dcF.last) / 1000);
    display_notice("[dmgchart] last fight: " + Math.round(dcDur) + "s, dealt " + dcF.outTotal + " (" + Math.round(dcF.outTotal / dcDur) + "/s), taken " + dcF.incTotal + " (" + Math.round(dcF.incTotal / dcDur) + "/s), " + (Date.now() - dcF.last > d.gap * 1000 ? "ended " + dcAgo + "s ago" : "under way") + ".", "cyan");
  } else {
    display_notice("[dmgchart] no fight yet.", "cyan");
  }
  display_notice("[dmgchart] tab showing " + (d.view == "session" ? "the recording" : (d.view ? "saved session #" + d.view : "the live fight")) + ". DMGCHART HELP for commands.", "cyan");
} else if (sub == "help") {
  run_function("dmgchart_help", [], "dmgchart");
} else if (sub == "list") {
  if (!d.saved.length) {
    display_notice("[dmgchart] no saved sessions. DMGCHART START [name] to record one.", "yellow");
  } else {
    display_notice("[dmgchart] " + d.saved.length + " saved session" + (d.saved.length == 1 ? "" : "s") + ", newest first:", "white");
    for (var li = d.saved.length - 1; li >= 0; li--) {
      var lv = d.saved[li];
      var lcs = Math.max(1, lv.combatMs / 1000);
      var ldt = new Date(lv.start);
      display_notice("  #" + lv.id + " " + lv.name + " - " + ldt.getDate() + "/" + (ldt.getMonth() + 1) + ", " + lv.fights + " fights, " + (lcs < 60 ? Math.round(lcs) + "s" : Math.round(lcs / 60) + "m") + " in combat, dealt " + Math.round(lv.outTotal / lcs) + "/s, taken " + Math.round(lv.incTotal / lcs) + "/s");
    }
  }
} else if (sub == "rebuild") {
  run_function("dmgchart_setup", ["rebuild"], "dmgchart");
  d = client.loom.dmgchart;
  display_notice("[dmgchart] rebuilt from the saved variables (gap " + d.gap + "s" + (d.sess ? ", recording '" + d.sess.name + "' resumed from its last checkpoint" : "") + ")", "cyan");
} else if (sub == "debug") {
  display_notice("[dmgchart] gap=" + d.gap + " view='" + d.view + "' saved=" + d.saved.length + " nextId=" + d.nextId + " hp=" + d.hp + " sess=" + (d.sess ? d.sess.name + "/" + d.sess.fights : "none") + " fight=" + (d.fight ? d.fight.outTotal + "/" + d.fight.incTotal : "none") + " lastInc=" + (d.lastInc ? d.lastInc.type + ":" + d.lastInc.amt : "none"), "orange");
} else {
  display_notice("[dmgchart] unknown command '" + sub + "'. DMGCHART HELP for commands.", "orange");
}
run_function("dmgchart_render", [], "dmgchart");
