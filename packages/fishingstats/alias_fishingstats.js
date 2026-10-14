// FISHINGSTATS [subcommand ...]: the one command for this package. The
// subcommand is case-insensitive; names, species and colours keep their case.
if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
var fsSub = String(args[1] || "").toLowerCase();
var fsRest = String(args[2] || "").trim();
var fsW = fsRest === "" ? [] : fsRest.split(/\s+/);
var fsW0 = (fsW[0] || "").toLowerCase();
var C = "cyan";
function fsSay(t, col) { display_notice("[fishingstats] " + t, col || C); }
function fsSave() { try { set_variable("fishingstats_session", JSON.stringify(FS.session)); } catch (e) {} }

if (fsSub === "" || fsSub === "status") {
  var s = FS.session;
  var now = Math.floor(new Date().getTime() / 1000);
  var el = now - (s.start || now);
  if (el < 1) { el = 1; }
  fsSay(s.n + " catches over " + Math.round(el / 60) + " min; you are " + FS.me + (FS.meSet ? "" : " (from the game)")
    + "; area " + (FS.areaNow || "unknown") + (FS.areaSrc === "manual" ? " (pinned)" : "")
    + "; filed after " + FS.gap + " min idle; " + FS.log.length + " session(s) in the log. FISHINGSTATS HELP for commands.");
  for (var k in s.anglers) {
    if (s.anglers.hasOwnProperty(k)) {
      var a = s.anglers[k];
      fsSay(k + ": " + a.n + " (" + Math.round((a.n / Math.max(1, s.n)) * 100) + "%), " + Math.floor(a.oz / 16) + "lb " + (a.oz % 16) + "oz total, best " + Math.floor(a.best / 16) + "lb " + (a.best % 16) + "oz " + a.bestSp);
    }
  }
  run_function("fishingstats_render", [], "fishingstats");
} else if (fsSub === "help") {
  run_function("fishingstats_help", [], "fishingstats");
} else if (fsSub === "end") {
  var had = FS.session.n;
  run_function("fishingstats_archive", [], "fishingstats");
  if (had > 0) { fsSay("session filed to the log (" + had + " landed). New session started.", "lime"); }
  else { fsSay("nothing landed, so nothing was filed. Session restarted.", "cyan"); }
} else if (fsSub === "discard") {
  if (fsW0 === "confirm") {
    FS.session = FS.blank();
    fsSave();
    run_function("fishingstats_render", [], "fishingstats");
    fsSay("current session discarded, without filing it. New session started.", "orange");
  } else {
    fsSay("this throws away the current session without filing it. FISHINGSTATS DISCARD CONFIRM to proceed.", "orange");
  }
} else if (fsSub === "log") {
  if (fsW0 === "wipe") {
    if ((fsW[1] || "").toLowerCase() === "confirm") {
      FS.log = [];
      try { set_variable("fishingstats_log", "[]"); } catch (e) {}
      run_function("fishingstats_log_render", [], "fishingstats");
      fsSay("session log cleared. The current session is untouched.", "orange");
    } else {
      fsSay("this clears ALL filed sessions. FISHINGSTATS LOG WIPE CONFIRM to proceed.", "orange");
    }
  } else {
    run_function("fishingstats_log_render", [], "fishingstats");
    fsSay(FS.log.length + " session(s) in the log; see the fishinglog tab.");
  }
} else if (fsSub === "area") {
  if (fsRest === "") {
    fsSay("area now: " + (FS.areaNow || "unknown") + " (from " + (FS.areaSrc || "nothing yet") + "). FISHINGSTATS AREA <name> to pin one, AREA AUTO to follow the game again, AREA RESET to forget the areas seen this session.");
  } else if (fsW0 === "auto" || fsW0 === "reset") {
    if (fsW0 === "auto") {
      FS.areaManual = "";
      try { set_variable("fishingstats_area", ""); } catch (e) {}
      FS.areaNow = FS.areaGmcp;
      FS.areaSrc = FS.areaGmcp ? "GMCP" : "";
    }
    // Areas accumulate across a session, so a stale pinned entry has to be
    // cleared out too, then reseeded from the area now in use.
    FS.session.areas = {};
    if (FS.areaNow) { FS.session.areas[FS.areaNow] = 1; }
    fsSave();
    run_function("fishingstats_render", [], "fishingstats");
    fsSay("area is now " + (FS.areaNow || "unknown") + " (from " + (FS.areaSrc || "nothing yet") + "). Earlier areas this session were forgotten.");
  } else {
    FS.areaManual = fsRest;
    FS.areaNow = fsRest;
    FS.areaSrc = "manual";
    try { set_variable("fishingstats_area", fsRest); } catch (e) {}
    FS.session.areas[fsRest] = (FS.session.areas[fsRest] || 0) + 1;
    fsSave();
    run_function("fishingstats_render", [], "fishingstats");
    fsSay("area pinned to " + fsRest + ". FISHINGSTATS AREA AUTO to follow the game again.", "lime");
  }
} else if (fsSub === "year") {
  if (fsW0) {
    FS.session.year = parseInt(fsW0, 10) || 0;
    fsSave();
    run_function("fishingstats_render", [], "fishingstats");
    fsSay("session year set to " + FS.session.year + " AF.", "lime");
  } else {
    fsSay("session year is " + (FS.session.year || "unknown") + ". It is picked up from the RANKINGS FISHING header, or set it with FISHINGSTATS YEAR 1014.");
  }
} else if (fsSub === "gap") {
  var m = fsW0 ? parseInt(fsW0, 10) : 0;
  if (!m) { fsSay("sessions are filed automatically after " + FS.gap + " minutes idle. FISHINGSTATS GAP 5-1440 to change it."); }
  else if (m < 5 || m > 1440) { fsSay("pick a gap between 5 and 1440 minutes.", "orange"); }
  else {
    FS.gap = m;
    try { set_variable("fishingstats_gap", String(m)); } catch (e) {}
    fsSay("idle gap set to " + m + " minutes.", "lime");
  }
} else if (fsSub === "me") {
  if (fsW0 === "auto") {
    FS.meSet = "";
    try { set_variable("fishingstats_me", ""); } catch (e) {}
    FS.me = FS.gmcpName || "You";
    run_function("fishingstats_render", [], "fishingstats");
    fsSay("your angler name follows the game again: " + FS.me + ".", "lime");
  } else if (fsW[0]) {
    FS.meSet = fsW[0];
    FS.me = fsW[0];
    try { set_variable("fishingstats_me", fsW[0]); } catch (e) {}
    run_function("fishingstats_render", [], "fishingstats");
    fsSay("your angler name is set to " + fsW[0] + "; your row is highlighted. FISHINGSTATS ME AUTO to take it from the game.", "lime");
  } else {
    fsSay("your angler name is " + FS.me + (FS.meSet ? " (set with FISHINGSTATS ME)" : " (from the game)") + ".");
  }
} else if (fsSub === "colour" || fsSub === "color") {
  var who = fsW[0] || "";
  var hex = fsW[1] || "";
  if (!who) {
    var listed = [];
    for (var q in FS.session.anglers) { if (FS.session.anglers.hasOwnProperty(q)) { listed.push(q + " " + (FS.col[q] || "default")); } }
    fsSay("colours: " + (listed.length ? listed.join(", ") : "none yet") + ". FISHINGSTATS COLOUR <name> <#rrggbb|RESET>.");
  } else if (!hex) {
    fsSay(who + " is " + (FS.col[who] || "on the default palette") + ". Give a hex value like #e8a13f, or RESET.");
  } else if (hex.toLowerCase() !== "reset" && !/^#[0-9a-fA-F]{6}$/.test(hex)) {
    fsSay("'" + hex + "' isn't a colour like #e8a13f.", "orange");
  } else {
    if (hex.toLowerCase() === "reset") { delete FS.col[who]; }
    else { FS.col[who] = hex; }
    try { set_variable("fishingstats_colours", JSON.stringify(FS.col)); } catch (e) {}
    run_function("fishingstats_render", [], "fishingstats");
    fsSay(who + " is now " + (hex.toLowerCase() === "reset" ? "back on the default palette" : hex) + ".", "lime");
  }
} else if (fsSub === "add") {
  var am = fsRest.match(/^(\S+)\s+(\d+)(?:\s+(\d+))?\s+(\D.*)$/);
  if (!am) {
    fsSay("FISHINGSTATS ADD <angler> <lb> [oz] <species>, e.g. FISHINGSTATS ADD Arlen 3 4 rock bass.", "orange");
  } else {
    var lbv = parseInt(am[2], 10) || 0;
    var ozv = parseInt(am[3], 10) || 0;
    FS.inp = { angler: am[1], species: am[4], oz: lbv * 16 + ozv };
    run_function("fishingstats_record", [], "fishingstats");
    fsSay("recorded " + am[1] + " " + lbv + "lb " + ozv + "oz " + am[4] + ".", "lime");
  }
} else if (fsSub === "csv") {
  var cs = FS.session;
  display_notice("angler,landed,casts,hooks,total_oz,best_oz,best_species", "white");
  for (var ck in cs.anglers) {
    if (cs.anglers.hasOwnProperty(ck)) {
      var ca = cs.anglers[ck];
      display_notice(ck + "," + ca.n + "," + (ca.casts || 0) + "," + (ca.hooks || 0) + "," + ca.oz + "," + ca.best + "," + ca.bestSp, "white");
    }
  }
  display_notice("species,caught,total_oz,best_oz,best_by", "white");
  for (var cf in cs.species) {
    if (cs.species.hasOwnProperty(cf)) {
      var cfs = cs.species[cf];
      display_notice(cf + "," + cfs.n + "," + cfs.oz + "," + cfs.best + "," + cfs.bestBy, "white");
    }
  }
} else if (fsSub === "learn") {
  if (fsW0 === "show") {
    var buf = FS.buf || [];
    fsSay(buf.length + " line(s) captured:");
    for (var bi = 0; bi < buf.length; bi++) { display_notice("| " + buf[bi], "yellow"); }
  } else if (fsW0 === "clear") {
    FS.buf = [];
    fsSay("buffer cleared.", "lime");
  } else {
    if (fsW0 === "on") { FS.learn = true; }
    else if (fsW0 === "off") { FS.learn = false; }
    else { FS.learn = !FS.learn; }
    if (FS.learn) { FS.buf = []; }
    fsSay("capture " + (FS.learn ? "ON. Catch a fish, have someone else catch one, then FISHINGSTATS LEARN OFF and LEARN SHOW." : "off. FISHINGSTATS LEARN SHOW dumps what was captured."), "lime");
  }
} else if (fsSub === "demo") {
  FS.session = FS.blank();
  FS.session.start -= 4500;
  var dWho = ["Arlen", "Mirela", "Tobin"];
  var dFish = ["pike", "blue eel", "rock bass", "catfish", "walleye", "trout"];
  for (var di = 0; di < 34; di++) {
    var dw = dWho[di % 3 === 0 ? 0 : (di % 5 === 0 ? 2 : (di % 2))];
    var dx = (di % 3 === 0) ? 2 : 1;
    for (var dj = 0; dj < dx; dj++) {
      FS.evt = { angler: dw, type: "cast" };
      run_function("fishingstats_event", [], "fishingstats");
    }
    FS.evt = { angler: dw, type: "hook" };
    run_function("fishingstats_event", [], "fishingstats");
    FS.inp = { angler: dw, species: dFish[(di * 5) % dFish.length], oz: 12 + ((di * 37) % 900) + (di % 5) * 40 };
    run_function("fishingstats_record", [], "fishingstats");
  }
  fsSay("demo data loaded into the tab. FISHINGSTATS DISCARD CONFIRM clears it.", "lime");
} else if (fsSub === "debug") {
  fsSay("me=" + FS.me + " meSet=" + FS.meSet + " gmcpName=" + FS.gmcpName + " area=" + FS.areaNow + " src=" + FS.areaSrc + " gmcpArea=" + FS.areaGmcp
    + " gap=" + FS.gap + " learn=" + FS.learn + " log=" + FS.log.length + " records year=" + FS.rec.year + " (" + Object.keys(FS.rec.f).length + " species)");
} else {
  fsSay("unknown command '" + fsSub + "'. FISHINGSTATS HELP for commands.", "orange");
}
