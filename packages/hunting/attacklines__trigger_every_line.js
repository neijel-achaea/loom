// Attack lines: a trigger on every line. Checks the
// line against the current class's attack patterns only (classes/*.js):
// on a match, tags and highlights it and starts the ability's battlerage
// cooldown. The first matching pattern wins.
if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
var huCls = HU.classes && HU.classes[HU.cls];
var huLines = huCls ? huCls.lines : null;
if (huLines && huLines.length) {
  var huText = String(args[1] || "");
  for (var huI = 0; huI < huLines.length; huI++) {
    var huRow = huLines[huI];
    if (!huRow[0].test(huText)) continue;
    var huTag = "[" + huRow[1] + "] ";
    // Colour the line, then insert the tag in the same colours, as the old
    // per-class triggers did. Both take (start, length, ...); a length of 0
    // inserts.
    colorize_current_line(0, huText.length, HU.lineFg, HU.lineBg);
    replace_current_line(0, 0, huTag, HU.lineFg, HU.lineBg);
    if (huRow[2]) {
      HU.cd[huRow[2]] = false;
      HU.glob = false;
      run_function("hunting_highlight", [], "hunting");
    }
    break;
  }
}

// Toggles that keep something up while on: a "renew" line means it dropped,
// so its command is sent again (not while triggers are paused).
var huTg = huCls && huCls.toggles;
if (huTg && get_variable("pauseTriggers") != "on") {
  var huLine = String(args[1] || "");
  for (var huTn in huTg) {
    var huRn = huTg[huTn].renew;
    if (huRn && HU.toggles[huTn] === "on" && huRn[0].test(huLine)) send_command(huRn[1]);
  }
}

// Interruptible abilities (Sentinel morph): a "pauses" row's first pattern
// pauses every package that respects pauseTriggers, its second resumes them.
var huPs = huCls && huCls.pauses;
if (huPs) {
  var huPl = String(args[1] || "");
  for (var huPi = 0; huPi < huPs.length; huPi++) {
    if (huPs[huPi][0].test(huPl)) { set_variable("pauseTriggers", "on"); HU.paused = true; }
    else if (huPs[huPi][1] && huPs[huPi][1].test(huPl)) { set_variable("pauseTriggers", "off"); HU.paused = false; }
  }
}
