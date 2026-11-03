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
  if (atW === "tiles" || atW === "text") { AT.setWildStyle(atW); display_notice("[atlas] wilderness map drawn as " + (atW === "tiles" ? "tiles." : "the game's letters."), "lime"); }
  else if (atW === "on" || atW === "off") { AT.setWild(atW === "on"); display_notice("[atlas] wilderness map " + (atW === "on" ? "in the Atlas tab (out of the main window)." : "back in the main window."), "lime"); }
  else if (!atW) display_notice("[atlas] the wilderness map shows " + (AT.wildOn ? "in the Atlas tab, as " + (AT.wildStyle === "text" ? "the game's letters" : "tiles") : "in the main window") + ". ATLAS WILDERNESS ON|OFF|TILES|TEXT.", "cyan");
  else display_notice("[atlas] ATLAS WILDERNESS ON|OFF|TILES|TEXT.", "orange");
} else if (atCmd === "go") {
  if (/^\d+$/.test(atRest)) AT.go(atRest);
  else display_notice("[atlas] ATLAS GO <room number>.", "orange");
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
