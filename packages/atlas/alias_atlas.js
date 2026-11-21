// ATLAS [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
var AT = client.loom.atlas;
var atRaw = String(args[1] || "").trim();
var atSp = atRaw.search(/\s/);
var atCmd = (atSp < 0 ? atRaw : atRaw.substring(0, atSp)).toLowerCase();
var atRest = atSp < 0 ? "" : atRaw.substring(atSp).trim();
if (atCmd === "" || atCmd === "status") {
  var atMap = AT.map ? "community map version " + AT.map.v + " (" + AT.map.n.toLocaleString("en-US") + " rooms, " + Object.keys(AT.map.areas).length + " areas, from " + AT.source + ")"
    : (AT.state == "loading" ? "the community map is loading" : "no map loaded" + (AT.note ? " (" + AT.note + ")" : "") + ": ATLAS RELOAD");
  var atHere = "";
  if (AT.here) {
    var atE = AT.here.area ? AT.look.explored(AT.here.area) : undefined;
    atHere = " Here: " + (AT.here.name || "?") + " (" + AT.here.id + ")" + (AT.here.area ? " in " + AT.areaName(AT.here.area) : "") + (AT.here.onMap ? "" : ", not on the community map") +
      (atE ? "; explored " + atE.explored + " of the " + atE.mapped + " rooms mapped there." : ".");
  }
  display_notice("[atlas] " + atMap + ". Fog of war " + (AT.fog ? "on" : "off") + "." + atHere, "cyan");
} else if (atCmd === "help") {
  run_function("atlas_help", [], "atlas");
} else if (atCmd === "reload") {
  if (AT.state == "loading") display_notice("[atlas] the community map is loading already.", "cyan");
  else { display_notice("[atlas] downloading the community map again.", "cyan"); AT.load(true); }
} else if (atCmd === "fog") {
  var atF = atRest.toLowerCase();
  if (atF === "on" || atF === "off") { AT.setFog(atF === "on"); display_notice("[atlas] fog of war " + atF + (atF === "on" ? ": only the rooms you've explored." : ": every room on the map, unexplored ones faint."), "lime"); }
  else if (!atF) display_notice("[atlas] fog of war is " + (AT.fog ? "on" : "off") + ". ATLAS FOG ON|OFF.", "cyan");
  else display_notice("[atlas] ATLAS FOG ON|OFF.", "orange");
} else if (atCmd === "wilderness" || atCmd === "wild") {
  var atW = atRest.toLowerCase();
  if (atW === "dump") {
    // The last steps' maps exactly as the game sent them, for a bug report.
    var atDl = AT.wildLog || [];
    if (!atDl.length) display_notice("[atlas] nothing recorded yet: take a few steps in the wilderness first.", "cyan");
    else {
      var atDs = JSON.stringify({ v: (client.loom.registry.atlas || {}).version || "", steps: atDl });
      var atDok = false;
      try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(atDs); atDok = true; } } catch (e) {}
      display_notice("[atlas] " + atDl.length + " wilderness steps (" + Math.round(atDs.length / 1024) + " KB)" + (atDok ? " copied to the clipboard: paste them into a file and send it." : ": copy them from the box."), "lime");
      if (!atDok) { try { window.prompt("Atlas: the last wilderness steps", atDs); } catch (e) {} }
    }
  } else if (atW === "legend") {
    var atLk = Object.keys(AT.wildSeen || {}).map(function (k) { return AT.wildSeen[k]; });
    atLk.sort(function (a, b) { return Object.keys(b.envs).length - Object.keys(a.envs).length || b.n - a.n; });
    if (!atLk.length) display_notice("[atlas] no wilderness seen yet this session: walk there with Atlas showing the map.", "cyan");
    else {
      display_notice("[atlas] wilderness characters seen this session (character, colour on background: where you stood on it):", "cyan");
      for (var atLi = 0; atLi < atLk.length; atLi++) {
        var atLe = atLk[atLi], atEn = Object.keys(atLe.envs).map(function (e) { return e + " ×" + atLe.envs[e]; });
        display_notice("  '" + atLe.c + "' " + (atLe.fg || "-") + " on " + (atLe.bg || "-") + ": " + (atEn.length ? atEn.join(", ") : "not stood on yet") + " (seen " + atLe.n + ")", "cyan");
      }
    }
  } else if (atW === "tiles" || atW === "text") { AT.setWildStyle(atW); display_notice("[atlas] wilderness map drawn as " + (atW === "tiles" ? "tiles." : "the game's letters."), "lime"); }
  else if (atW === "on" || atW === "off") { AT.setWild(atW === "on"); display_notice("[atlas] wilderness map " + (atW === "on" ? "in the Atlas tab (out of the main window)." : "back in the main window."), "lime"); }
  else if (!atW) display_notice("[atlas] the wilderness map shows " + (AT.wildOn ? "in the Atlas tab, as " + (AT.wildStyle === "text" ? "the game's letters" : "tiles") : "in the main window") + ". ATLAS WILDERNESS ON|OFF|TILES|TEXT|LEGEND|DUMP.", "cyan");
  else display_notice("[atlas] ATLAS WILDERNESS ON|OFF|TILES|TEXT|LEGEND|DUMP.", "orange");
} else if (atCmd === "go") {
  if (atRest) AT.goPlace(atRest);
  else display_notice("[atlas] ATLAS GO <room number | area | denizen>.", "orange");
} else if (atCmd === "walk") {
  var atWk = atRest.toLowerCase();
  // PATHFIND | CUSTOM (Ricardo); ATLAS | GAME still understood (test builds).
  if (atWk === "atlas") atWk = "custom"; else if (atWk === "game") atWk = "pathfind";
  if (atWk === "custom" || atWk === "pathfind") { AT.setOwnWalk(atWk === "custom"); display_notice("[atlas] clicks now walk " + (atWk === "custom" ? "Atlas's own route, a step at a time (the game's PATH FIND where the map has none). ATLAS WALK PATHFIND to go back." : "with the game's PATH FIND."), "lime"); }
  else display_notice("[atlas] clicks walk " + (AT.ownWalk ? "Atlas's own route" : "with the game's PATH FIND") + ". ATLAS WALK PATHFIND|CUSTOM.", atWk ? "orange" : "cyan");
} else if (atCmd === "wormholes" || atCmd === "worms") {
  var atWo = atRest.toLowerCase();
  if (atWo === "on" || atWo === "off") { AT.setWorms(atWo === "on"); display_notice("[atlas] Atlas's routes " + (atWo === "on" ? "take wormholes (WORM WARP) where they're shorter." : "leave wormholes out."), "lime"); }
  else display_notice("[atlas] Atlas's routes " + (AT.useWorms ? "take" : "leave out") + " wormholes. ATLAS WORMHOLES ON|OFF.", atWo ? "orange" : "cyan");
} else if (atCmd === "veil") {
  var atVe = atRest.toLowerCase();
  if (atVe === "on" || atVe === "off") { AT.setVeil(atVe === "on"); display_notice("[atlas] Atlas's routes " + (atVe === "on" ? "may start with PIERCE THE VEIL to Dragonspire Mount while you're in dragonform." : "leave the Veil out."), "lime"); }
  else display_notice("[atlas] Atlas's routes " + (AT.useVeil ? "may start with PIERCE THE VEIL in dragonform" + (AT.isDragon() ? "" : " (you're not a dragon now)") : "leave the Veil out") + ". ATLAS VEIL ON|OFF.", atVe ? "orange" : "cyan");
} else if (atCmd === "broken") {
  var atBk = Object.keys(AT.broken).sort();
  if (/^clear\b/i.test(atRest)) {
    var atBr = atRest.replace(/^clear\s*/i, "");
    var atBn = 0;
    for (var atBi = 0; atBi < atBk.length; atBi++) if (!atBr || atBk[atBi].split("|")[0] === atBr) { delete AT.broken[atBk[atBi]]; atBn++; }
    AT.brokenSave();
    display_notice("[atlas] forgot " + atBn + " broken shortcut" + (atBn === 1 ? "" : "s") + (atBr ? " in room " + atBr : "") + ": routes may take " + (atBn === 1 ? "it" : "them") + " again.", "lime");
  } else if (!atBk.length) display_notice("[atlas] no broken shortcuts: every one the map has is used (when it's on).", "cyan");
  else {
    var atBl = atBk.map(function (k) { var p = k.split("|"); return p[1] + " in " + AT.label(Number(p[0])) + " (" + new Date(AT.broken[k]).toISOString().slice(0, 10) + ")"; });
    display_notice("[atlas] " + atBk.length + " broken shortcut" + (atBk.length === 1 ? "" : "s") + ", left out of routes: " + atBl.join("; ") + ". ATLAS BROKEN CLEAR [room] forgets them.", "cyan");
  }
} else if (atCmd === "stop") {
  if (AT.walk) AT.walkEnd("ATLAS STOP");
  else display_notice("[atlas] not walking anywhere.", "cyan");
} else if (atCmd === "route") {
  if (!/^\d+$/.test(atRest)) display_notice("[atlas] ATLAS ROUTE <room number>: the route Atlas would walk, without walking it.", "orange");
  else if (!AT.here) display_notice("[atlas] Atlas doesn't know where you are yet: take a step.", "orange");
  else {
    var atP = AT.route(AT.here.id, Number(atRest));
    if (!atP) display_notice("[atlas] no route from " + AT.label(AT.here.id) + " to " + AT.label(Number(atRest)) + " on the map (a click would ask the game's PATH FIND).", "orange");
    else display_notice("[atlas] " + atP.dirs.length + " step" + (atP.dirs.length === 1 ? "" : "s") + " to " + AT.label(Number(atRest)) + ": " + atP.dirs.join(", ") + ".", "cyan");
  }
} else if (atCmd === "tag" || atCmd === "untag") {
  var atTa = AT.findArea(atRest);
  if (!atTa || !atTa.rest) display_notice("[atlas] ATLAS " + atCmd.toUpperCase() + " <area|number|HERE> <tag> [tag…]" + (atCmd === "untag" ? ", or ALL" : "") + (AT.map ? "" : " (the map isn't loaded)") + ".", "orange");
  else if (atCmd === "tag") AT.tag(atTa.aid, atTa.rest.split(/\s+/));
  else AT.untag(atTa.aid, atTa.rest.split(/\s+/));
} else if (atCmd === "tags") {
  var atTc = {}, atTn = [];
  for (var atTk in AT.tags) if (AT.tags.hasOwnProperty(atTk)) for (var atTi = 0; atTi < AT.tags[atTk].length; atTi++) { var atTw = AT.tags[atTk][atTi]; if (!atTc[atTw]) { atTc[atTw] = 0; atTn.push(atTw); } atTc[atTw]++; }
  atTn.sort();
  display_notice(atTn.length ? "[atlas] tags: " + atTn.map(function (t) { return t + " (" + atTc[t] + ")"; }).join(", ") + "." : "[atlas] no tags yet: ATLAS TAG HERE <tag> tags the area you're in.", "cyan");
} else if (atCmd === "hide" || atCmd === "unhide") {
  var atHa = AT.findArea(atRest);
  if (!atHa || atHa.rest) display_notice("[atlas] ATLAS " + atCmd.toUpperCase() + " <area|number|HERE>" + (atHa && atHa.rest ? ": '" + atHa.rest + "' isn't part of an area's name" : "") + ".", "orange");
  else if (!!AT.hidden[atHa.aid] === (atCmd === "hide")) display_notice("[atlas] " + AT.title(atHa.aid) + " is " + (atCmd === "hide" ? "hidden" : "shown") + " already.", "cyan");
  else { AT.setHidden(atHa.aid, atCmd === "hide"); display_notice("[atlas] " + AT.title(atHa.aid) + (atCmd === "hide" ? " hidden: out of the Areas list and the totals." : " shown again in the Areas tab."), "lime"); }
} else if (atCmd === "show") {
  var atSa = AT.findArea(atRest);
  if (!atSa || atSa.rest) display_notice("[atlas] ATLAS SHOW <area|number>.", "orange");
  else AT.showArea(atSa.aid);
} else if (atCmd === "areas") {
  var atVn = 0, atN = 0, atM = 0, atAll = 0, atU = 0;
  for (var atAa in AT.map ? AT.map.areas : {}) {
    if (!AT.map.areas.hasOwnProperty(atAa) || AT.hidden[atAa]) continue;
    var atMp = AT.areaRooms(Number(atAa)).length, atCn = AT.count(Number(atAa));
    if (!atMp) continue;
    atAll += atMp;
    if (atCn >= 0) { atVn++; atN += Math.min(atCn, atMp); atM += atMp; } else atU++;
  }
  if (!AT.map) display_notice("[atlas] the community map isn't loaded: ATLAS RELOAD.", "orange");
  else display_notice("[atlas] visited " + atVn + " of " + (atVn + atU) + " areas; explored " + atN.toLocaleString("en-US") + " of their " + atM.toLocaleString("en-US") + " rooms (" + (atM ? Math.floor(atN / atM * 100) : 0) + "%), " + (atAll ? (atN / atAll * 100).toFixed(1) : 0) + "% of the whole map. The Areas tab lists them.", "cyan");
} else if (atCmd === "sort") {
  var atSo = { name: "name", progress: "pct", pct: "pct", "%": "pct", least: "pct", most: "pct-desc", left: "left", rooms: "left" }[atRest.toLowerCase()];
  var atSoN = { name: "by name", pct: "least explored first", "pct-desc": "most explored first", left: "most rooms left first" };
  if (!atRest) display_notice("[atlas] the Areas tab is sorted " + atSoN[AT.sort] + ". ATLAS SORT NAME|LEAST|MOST|LEFT.", "cyan");
  else if (!atSo) display_notice("[atlas] ATLAS SORT NAME|LEAST|MOST|LEFT.", "orange");
  else { AT.useSort(atSo); display_notice("[atlas] areas sorted " + atSoN[AT.sort] + ".", "lime"); }
} else if (atCmd === "mark") {
  // MARK <icon> [note] for the room you're in; MARK <number> <icon> [note].
  var atMw = atRest.split(/\s+/), atMid = 0, atMi2 = 0;
  if (/^\d+$/.test(atMw[0] || "")) { atMid = Number(atMw[0]); atMi2 = 1; }
  else atMid = AT.here ? AT.here.id : 0;
  var atIcon = AT.iconOf(atMw[atMi2]);
  if (!atRest || !atIcon) display_notice("[atlas] ATLAS MARK [room number] <icon> [note]. Icons: " + Object.keys(AT.icons).join(", ") + ".", "orange");
  else if (!(atMid > 0)) display_notice("[atlas] no room yet: move or LOOK first, or give a room number.", "orange");
  else if (AT.map && !AT.room(atMid)) display_notice("[atlas] room " + atMid + " isn't on the map.", "orange");
  else AT.mark(atMid, atIcon, atMw.slice(atMi2 + 1).join(" "));
} else if (atCmd === "unmark") {
  var atUid = /^\d+$/.test(atRest) ? Number(atRest) : (atRest ? 0 : (AT.here ? AT.here.id : 0));
  if (!(atUid > 0)) display_notice("[atlas] ATLAS UNMARK [room number] (no number: the room you're in).", "orange");
  else AT.unmark(atUid);
} else if (atCmd === "marks") {
  display_notice("[atlas] icons: " + Object.keys(AT.icons).map(function (k) { return k + " (" + AT.icons[k][0] + ")"; }).join(", ") + ".", "cyan");
  var atMl = [];
  for (var atMr in AT.marks) if (AT.marks.hasOwnProperty(atMr)) { var atRr = AT.room(atMr); atMl.push("  " + AT.marks[atMr][0] + ": " + (atRr && atRr.n ? atRr.n + " " : "") + "(" + atMr + ")" + (atRr ? ", " + AT.title(atRr.a) : "") + (AT.marks[atMr][1] ? " - " + AT.marks[atMr][1] : "")); }
  if (!atMl.length) display_notice("[atlas] no rooms marked yet: ATLAS MARK <icon> marks the room you're in.", "cyan");
  else { display_notice("[atlas] your marks:", "cyan"); for (var atMj = 0; atMj < atMl.length; atMj++) display_notice(atMl[atMj], "cyan"); }
} else if (atCmd === "debug") {
  var atEx = [];
  for (var atA in AT.explored) if (AT.explored.hasOwnProperty(atA)) atEx.push(atA + ":" + Object.keys(AT.explored[atA]).length);
  atEx.push("game area here " + AT.hereGame + ", known crowdmap areas " + Object.keys(AT.known).join("/"));
  display_notice("[atlas] state=" + AT.state + " source=" + (AT.source || "-") + " note=" + (AT.note || "-") + " here=" + JSON.stringify(AT.here) + " view=" + JSON.stringify(AT.view) + " explored={" + atEx.join(", ") + "} tabs=" + AT.svgs().length, "cyan");
} else {
  display_notice("[atlas] unknown command '" + atCmd + "'. ATLAS HELP for commands.", "orange");
}
