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
    " Today: " + (crB ? crB.ev.length : 0) + " entr" + (crB && crB.ev.length === 1 ? "y" : "ies") + ". Kept: " + CR.days.length + " day" + (CR.days.length === 1 ? "" : "s") + ", " + crKept + " entries." +
    " Summaries: " + (!CR.getKey() ? "no key (CHRONICLE KEY)" : CR.auto ? "on, " + CR.model : "off") + (CR.usage.calls ? "; " + CR.usage.calls + " written, " + CR.usage.inTok + " tokens in, " + CR.usage.outTok + " out" : "") + (CR.lastErr ? "; last error: " + CR.lastErr : "") + ".", "cyan");
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
} else if (crCmd === "KEY") {
  var crKey = crW[1] || "";
  if (!crKey) display_notice("[chronicle] " + (CR.getKey() ? "an API key is set in this browser." : "no API key in this browser.") + " CHRONICLE KEY <key> sets it, CHRONICLE KEY CLEAR removes it.", "cyan");
  else if (crKey.toUpperCase() === "CLEAR") { CR.setKey(""); display_notice("[chronicle] key removed from this browser.", "lime"); }
  else if (!CR.setKey(crKey)) display_notice("[chronicle] this browser wouldn't store the key.", "orange");
  else {
    display_notice("[chronicle] key stored in this browser only (not in your Nexus settings: set it again on another computer). Each day's record, including what others said around you, is sent to Anthropic to write its summary; it costs a little per day on your key.", "lime");
    CR.due();
  }
} else if (crCmd === "VOICE") {
  if (!crRest) display_notice("[chronicle] " + (CR.voice ? "your notes on the character: " + CR.voice : "no notes on the character yet: CHRONICLE VOICE <text> (who they are, what they're after, how they speak).") + " The game adds: " + (CR.facts() || "nothing yet (log in again)") + " Written in the " + CR.person + " person.", "cyan");
  else if (crRest.toUpperCase() === "CLEAR") { CR.voice = ""; set_variable("chronicle_voice", ""); display_notice("[chronicle] notes cleared.", "lime"); }
  else { CR.voice = CR.clip(crRest, 2000); set_variable("chronicle_voice", CR.voice); display_notice("[chronicle] notes kept; the next summary uses them.", "lime"); }
} else if (crCmd === "PERSON") {
  var crP = String(crW[1] || "").toUpperCase();
  if (crP !== "FIRST" && crP !== "THIRD") display_notice("[chronicle] usage: CHRONICLE PERSON FIRST|THIRD (now " + CR.person + ").", "orange");
  else { CR.person = crP.toLowerCase(); set_variable("chronicle_person", CR.person); display_notice("[chronicle] summaries in the " + CR.person + " person" + (CR.person === "first" ? ", as the character's journal." : ", as a chronicler's record."), "lime"); }
} else if (crCmd === "MODEL") {
  if (!crW[1]) display_notice("[chronicle] model: " + CR.model + ". CHRONICLE MODEL <id> to change it, DEFAULT for " + CR.defaultModel + ".", "cyan");
  else { CR.model = crW[1].toUpperCase() === "DEFAULT" ? CR.defaultModel : crW[1]; set_variable("chronicle_model", CR.model === CR.defaultModel ? "" : CR.model); display_notice("[chronicle] model: " + CR.model + ".", "lime"); }
} else if (crCmd === "SUMMARIES") {
  var crS = String(crW[1] || "").toUpperCase();
  if (crS !== "ON" && crS !== "OFF") display_notice("[chronicle] usage: CHRONICLE SUMMARIES ON|OFF (now " + (CR.auto ? "on" : "off") + ").", "orange");
  else { CR.auto = crS === "ON"; set_variable("chronicle_auto", CR.auto ? "on" : "off"); display_notice("[chronicle] summaries at the end of each day " + (CR.auto ? "on." : "off: CHRONICLE WRITE still writes one by hand."), "lime"); if (CR.auto) CR.due(); }
} else if (crCmd === "WRITE") {
  var crWd = CR.findItem(crRest);
  if (!crWd) display_notice("[chronicle] nothing by that name in the record" + (crRest ? " ('" + crRest + "')" : "") + ". CHRONICLE WRITE [today|yesterday|<day> <month>|MONTH [name]|YEAR [number]].", "orange");
  else if (CR.busy) display_notice("[chronicle] a summary is being written; try again in a moment.", "orange");
  else { display_notice("[chronicle] writing " + CR.label(crWd) + "...", "cyan"); CR.write(crWd, true); }
} else if (crCmd === "RETRY") {
  var crF = 0;
  for (var crR = 0; crR < CR.days.length; crR++) { if (CR.days[crR].fails) { crF++; delete CR.days[crR].fails; } }
  for (var crAf in CR.annals.f) { if (CR.annals.f.hasOwnProperty(crAf)) crF++; }
  CR.annals.f = {};
  CR.saveAnnals();
  if (CR.retryT) { clearTimeout(CR.retryT); CR.retryT = null; }
  CR.save();
  display_notice("[chronicle] " + (crF ? crF + " failed summar" + (crF === 1 ? "y" : "ies") + " will be tried again" : "nothing had failed") + "; writing what's due.", "lime");
  CR.due();
  run_function("chronicle_render", [], "chronicle");
} else if (crCmd === "IGNORE" || crCmd === "UNIGNORE") {
  var crWho = String(crW[1] || "").replace(/[^A-Za-z]/g, "");
  if (!crWho) display_notice("[chronicle] " + (CR.ignore.length ? "left out of the record: " + CR.ignore.map(function (n) { return n.charAt(0).toUpperCase() + n.slice(1); }).join(", ") + "." : "no one is left out of the record.") + " CHRONICLE IGNORE|UNIGNORE <name>.", "cyan");
  else {
    var crLc = crWho.toLowerCase(), crNm = crLc.charAt(0).toUpperCase() + crLc.slice(1);
    if (crCmd === "IGNORE") {
      if (CR.ignore.indexOf(crLc) < 0) CR.ignore.push(crLc);
      set_variable("chronicle_ignore", JSON.stringify(CR.ignore));
      var crGone = CR.purge(crLc);
      CR.save();
      display_notice("[chronicle] " + crNm + " is left out of the record from now on: their words, emotes, messages and posts aren't kept, and other lines say \"someone\" for them." + (crGone ? " " + crGone + " line" + (crGone === 1 ? "" : "s") + " already kept were removed." : "") + " Summaries already written stay as they are (CHRONICLE WRITE <day> rewrites one).", "lime");
    } else {
      CR.ignore = CR.ignore.filter(function (n) { return n !== crLc; });
      set_variable("chronicle_ignore", JSON.stringify(CR.ignore));
      display_notice("[chronicle] " + crNm + " is recorded again from now on.", "lime");
    }
  }
} else if (crCmd === "VIEW") {
  var crV = String(crW[1] || "").toLowerCase();
  if (crV !== "days" && crV !== "months" && crV !== "years") display_notice("[chronicle] usage: CHRONICLE VIEW DAYS|MONTHS|YEARS (or click them in the tab).", "orange");
  else CR.setView(crV);
} else if (crCmd === "DEBUG") {
  var crN = 0;
  for (var crD = 0; crD < CR.days.length; crD++) crN += CR.days[crD].ev.length;
  display_notice("[chronicle] me=" + (CR.me || "?") + " anchor=" + (CR.anchor ? JSON.stringify(CR.anchor) : "none") + " today=" + CR.today() +
    " days=" + CR.days.length + " events=" + crN + " bytes~" + JSON.stringify(CR.days).length +
    " room=" + (CR.room ? CR.room.name + " (" + Math.round((Date.now() - CR.room.at) / 1000) + "s)" : "none") +
    " area=" + (CR.area ? CR.area.name : "none") + " players=" + Object.keys(CR.players).join(",") +
    " capture=" + (CR.capt ? CR.capt.ev.k + "/" + CR.capt.lines.length : "none") + " more=" + (CR.cont ? "waiting" : "no") +
    " overrides=" + JSON.stringify(CR.over) + " queue=" + JSON.stringify(CR.queue) + " busy=" + CR.busy + " key=" + (CR.getKey() ? "set" : "none") + " char=" + JSON.stringify(CR.char) + (CR.lastRes ? " lastAnswer=" + CR.lastRes : ""), "cyan");
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
