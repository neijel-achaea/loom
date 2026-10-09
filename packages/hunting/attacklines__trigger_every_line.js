// Attack lines: a trigger on every line. Checks the
// line against the current class's attack patterns only (classes/*.js):
// on a match, tags and highlights it, starts the ability's battlerage
// cooldown and plays its sound. The first matching pattern wins.
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
    // Tag first, then colour the whole line, tag included, as the old
    // per-class triggers did.
    replace_current_line(0, 0, huTag);
    colorize_current_line(0, huTag.length + huText.length, HU.lineFg, HU.lineBg);
    if (huRow[2]) {
      HU.cd[huRow[2]] = false;
      HU.glob = false;
      run_function("hunting_highlight", [], "hunting");
    }
    if (huRow[3] && typeof play_sound == "function") play_sound(huRow[3]);
    break;
  }
}
