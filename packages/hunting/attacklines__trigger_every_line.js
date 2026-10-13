// Attack lines: a trigger on every line. Checks the
// line against the current class's attack patterns (classes/*.js), then the
// lines every class shares (HU.sharedLines, in hunting_classes.js):
// on a match, tags and highlights it and starts the ability's battlerage
// cooldown. The first matching pattern wins.
if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
var huCls = HU.classes && HU.classes[HU.cls];
var huLines = (huCls && huCls.lines ? huCls.lines : []).concat(HU.sharedLines || []);
if (huCls && huLines.length) {
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
    // A shieldbreak (the class's "razes") has no cooldown of its own and
    // doesn't start the global one, so the game never says it is ready
    // again: marking it would leave every rage key dark until another
    // ability ran its course.
    var huRz = (huCls.razes || []).indexOf(huRow[2]) >= 0;
    if (huRow[2] && !huRz) {
      HU.cd[huRow[2]] = false;
      HU.glob = false;
      run_function("hunting_highlight", [], "hunting");
    }
    break;
  }
}

// Lines to hide (a class's "gags"), such as the Monk's "You connect!" after
// each hit of a combo.
var huGags = huCls && huCls.gags;
if (huGags) {
  var huGl = String(args[1] || "");
  for (var huGi = 0; huGi < huGags.length; huGi++) { if (huGags[huGi].test(huGl)) { gag_current_line(); break; } }
}

// Toggles whose state the game reports ("seen": [/now on/, /now off/]): the
// key follows, whether it was switched from the key, typed, or dropped.
var huTs = huCls && huCls.toggles;
if (huTs) {
  var huTl = String(args[1] || "");
  for (var huTsn in huTs) {
    var huSeen = huTs[huTsn].seen;
    if (!huSeen) continue;
    var huTsNew = huSeen[0] && huSeen[0].test(huTl) ? "on" : (huSeen[1] && huSeen[1].test(huTl) ? "off" : "");
    if (huTsNew && HU.toggles[huTsn] !== huTsNew) {
      HU.toggles[huTsn] = huTsNew;
      set_variable("hunting_toggles", JSON.stringify(HU.toggles));
      run_function("hunting_buttons", [], "hunting");
    }
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
// An optional third field is a command sent once paused (the Monk's "ok" to a
// Tekura grading).
var huPs = huCls && huCls.pauses;
if (huPs) {
  var huPl = String(args[1] || "");
  for (var huPi = 0; huPi < huPs.length; huPi++) {
    if (huPs[huPi][0].test(huPl)) { set_variable("pauseTriggers", "on"); HU.paused = true; if (huPs[huPi][2]) send_command(huPs[huPi][2]); }
    else if (huPs[huPi][1] && huPs[huPi][1].test(huPl)) { set_variable("pauseTriggers", "off"); HU.paused = false; }
  }
}
