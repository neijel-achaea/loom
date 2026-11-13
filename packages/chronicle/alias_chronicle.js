// CHRONICLE [command] -- see chronicle_help.
if (!client.loom || !client.loom.chronicle || !client.loom.chronicle.line) run_function("chronicle_setup", [], "chronicle");
var CR = client.loom.chronicle;
var crIn = String(args[1] || "").replace(/^\s+|\s+$/g, "");
var crW = crIn.split(/\s+/);
var crCmd = crIn ? crW[0].toUpperCase() : "";
var crRest = crIn.replace(/^\S+\s*/, "");
CR.borrowDate();
if (crCmd === "" || crCmd === "STATUS") {
  var crToday = CR.today();
  var crB = CR.bucket(crToday, false);
  var crKept = 0;
  for (var crI = 0; crI < CR.days.length; crI++) crKept += CR.days[crI].ev.length;
  display_notice("[chronicle] " + (crToday ? "Today is the " + CR.dayName(crToday) + "." : "The date isn't known yet: it comes with the next hour's date line, or DATE.") +
    " Today: " + (crB ? crB.ev.length : 0) + " entr" + (crB && crB.ev.length === 1 ? "y" : "ies") + ". Kept: " + CR.days.length + " day" + (CR.days.length === 1 ? "" : "s") + ", " + crKept + " entries.", "cyan");
} else if (crCmd === "HELP") {
  run_function("chronicle_help", [], "chronicle");
} else if (crCmd === "NOTE") {
  if (!crRest) display_notice("[chronicle] usage: CHRONICLE NOTE <text>", "orange");
  else { CR.add({ k: "note", text: CR.clip(crRest, CR.textMax) }); display_notice("[chronicle] noted.", "lime"); }
} else if (crCmd === "CHANNELS") {
  var crKeys = {};
  for (var crK in CR.seen) { if (CR.seen.hasOwnProperty(crK)) crKeys[crK] = true; }
  for (var crO in CR.over) { if (CR.over.hasOwnProperty(crO)) crKeys[crO] = true; }
  var crList = [];
  for (var crL in crKeys) { if (crKeys.hasOwnProperty(crL)) crList.push(crL); }
  crList.sort();
  if (!crList.length) display_notice("[chronicle] no channel heard yet this session.", "cyan");
  else {
    display_notice("[chronicle] channels (heard this session or set by you):", "cyan");
    for (var crJ = 0; crJ < crList.length; crJ++) {
      var crC = crList[crJ];
      var crOn = crC === "tells" ? (CR.over.tells !== undefined ? !!CR.over.tells : true) : CR.chanOn(crC);
      var crCap = CR.captions[crC] ? " (" + CR.captions[crC] + ")" : "";
      display_notice("  " + crC + crCap + ": " + (crOn ? "kept" : "left out") + (CR.over[crC] !== undefined ? ", set by you" : ""), crOn ? "lime" : "cyan");
    }
  }
} else if (crCmd === "CHANNEL") {
  var crName = String(crW[1] || "").toLowerCase();
  var crSw = String(crW[2] || "").toUpperCase();
  if (!crName || (crSw !== "ON" && crSw !== "OFF" && crSw !== "DEFAULT")) display_notice("[chronicle] usage: CHRONICLE CHANNEL <name> ON|OFF|DEFAULT (names as CHRONICLE CHANNELS shows them)", "orange");
  else {
    if (crName === "tell") crName = "tells";
    if (crSw === "DEFAULT") delete CR.over[crName];
    else CR.over[crName] = crSw === "ON";
    set_variable("chronicle_channels", JSON.stringify(CR.over));
    display_notice("[chronicle] " + crName + ": " + (crSw === "DEFAULT" ? "back to the default (" + ((crName === "tells" || CR.chanDefault(crName)) ? "kept" : "left out") + ")" : (crSw === "ON" ? "kept" : "left out")) + ".", "lime");
  }
} else if (crCmd === "EXPORT") {
  if (String(crW[1] || "").toUpperCase() === "SHOW") {
    var crMd = CR.lastExport || CR.markdown(CR.days);
    var crEsc = crMd.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function") nexusclient.add_html_line('<span style="font-family:\'Courier New\',monospace;white-space:pre-wrap">' + crEsc + '</span>');
    else display_notice(crMd, "cyan");
  } else if (!CR.days.length) {
    display_notice("[chronicle] nothing recorded yet.", "cyan");
  } else if (CR.download()) {
    display_notice("[chronicle] exported " + CR.days.length + " day" + (CR.days.length === 1 ? "" : "s") + " as a Markdown file. No download? CHRONICLE EXPORT SHOW prints it here to copy.", "lime");
  } else {
    display_notice("[chronicle] the browser refused the download: CHRONICLE EXPORT SHOW prints the record here to copy.", "orange");
  }
} else if (crCmd === "DEBUG") {
  var crN = 0;
  for (var crD = 0; crD < CR.days.length; crD++) crN += CR.days[crD].ev.length;
  display_notice("[chronicle] me=" + (CR.me || "?") + " anchor=" + (CR.anchor ? JSON.stringify(CR.anchor) : "none") + " today=" + CR.today() +
    " days=" + CR.days.length + " events=" + crN + " bytes~" + JSON.stringify(CR.days).length +
    " room=" + (CR.room ? CR.room.name + " (" + Math.round((Date.now() - CR.room.at) / 1000) + "s)" : "none") +
    " area=" + (CR.area ? CR.area.name : "none") + " players=" + Object.keys(CR.players).join(",") +
    " capture=" + (CR.capt ? CR.capt.ev.k + "/" + CR.capt.lines.length : "none") + " more=" + (CR.cont ? "waiting" : "no") +
    " overrides=" + JSON.stringify(CR.over), "cyan");
} else if (crCmd === "RESET") {
  if (CR.saveT) { clearTimeout(CR.saveT); CR.saveT = null; CR.save(); }
  client.loom.chronicle = {};
  run_function("chronicle_setup", [], "chronicle");
  run_function("chronicle_render", [], "chronicle");
  display_notice("[chronicle] rebuilt from the saved variables; the record is kept.", "lime");
} else if (crCmd === "CLEAR") {
  var crAll = 0;
  for (var crE = 0; crE < CR.days.length; crE++) crAll += CR.days[crE].ev.length;
  if (String(crW[1] || "").toUpperCase() !== "CONFIRM") display_notice("[chronicle] this throws away the whole record (" + CR.days.length + " days, " + crAll + " entries). CHRONICLE CLEAR CONFIRM to do it; CHRONICLE EXPORT first to keep a copy.", "orange");
  else {
    CR.days = [];
    CR.save();
    run_function("chronicle_render", [], "chronicle");
    display_notice("[chronicle] the record is cleared.", "lime");
  }
} else {
  display_notice("[chronicle] unknown command '" + crW[0] + "'. CHRONICLE HELP for commands.", "orange");
}
