// hunting_buttons -- lays out the F-key buttons for the current class, from
// its file in classes/ (see classes/README.md), and makes that class's
// battlerage costs the ones in use. Rows are [label, command] or
// [label, command, "main"]: "main" lights the key whenever you have balance
// and equilibrium. A key whose label has a battlerage cost is tracked for
// rage highlighting automatically.
var HU = client.loom.hunting;
var huEntry = HU.classes[HU.cls];
HU.costs = (huEntry && huEntry.rage) || {};

var huDragon = get_variable("hunting_dragon_attack") || "gut";
var huModes = { physical: "PHY", magical: "MAG", auto: "AUT" };
var huMode = huModes[get_variable("hunting_dragon_mode")] || "AUT";
// The staff attack is magi's setting when it's installed (artificing's
// before magi 0.1.0, whose names are read until magi has moved them).
var huStaff = (client.loom.magi && client.loom.magi.staff) || get_variable("magi_staff") || get_variable("artificing_staff") || get_variable("staffAttack") || "scintilla";
// Remembered so a new staff attack redraws the keys (see onGMCP).
HU.staffDrawn = huStaff;
var huTarget = get_variable("hunting_party_target") || "";
// F9 opens huntstats when that package is around; otherwise the key stays empty.
// Its saved records count too, as huntstats may load after hunting.
var huStats = (client.loom.registry && client.loom.registry.huntstats) || get_variable("huntstats_log") || client.track || get_variable("hs_log");

// A class with no layout yet gets the generic keys only.
var huGeneric = [["", ""], ["", ""], ["", ""], ["", ""], ["", ""], ["", ""], ["", ""], ["", ""], ["{stats}", ""], ["Diag", "diagnose"], ["", ""], ["Shield", "touch shield"]];
var huRows = (huEntry && huEntry.keys) || huGeneric;
// Keys that depend on your specialisation: specKeys["<Spec>"] = { <F-key>: row }.
var huSpecRows = huEntry && huEntry.specKeys && HU.spec ? huEntry.specKeys[HU.spec] : null;
if (huSpecRows) {
  huRows = huRows.slice();
  for (var huF in huSpecRows) huRows[to_number(huF) - 1] = huSpecRows[huF];
}
HU.slots = {};
HU.main = [];
run_function("hunting_mainlist", [], "hunting");

// PK MODE (#342): your PK keys for this class replace those keys, unlit; the
// others stay as they are.
var huPk = HU.pk ? HU.pkFor() : {};
for (var huK = 1; huK <= 12; huK++) {
  buttons_set_highlight(huK, 0);
  var huPkRow = huPk[String(huK)];
  if (Array.isArray(huPkRow) && huPkRow.length >= 2) {
    var huPkSep = (client._settings && typeof client._settings.stack_delimiter == "string" && client._settings.stack_delimiter) || "|";
    buttons_set_label(huK, String(huPkRow[0]));
    buttons_set_commands(huK, String(huPkRow[1]).split(/\s*\|\s*/).join(huPkSep));
    continue;
  }
  var huRow = huRows[huK - 1] || ["", ""];
  var huLabel = huRow[0];
  var huCmd = huRow[1];
  if (huLabel == "{stats}") {
    huLabel = huStats ? "Stats" : "";
    huCmd = huStats ? "huntstats" : "";
  }
  // {main}: the main attack in use (HUNTING MAIN); lit on balance and
  // equilibrium.
  if (huLabel == "{main}") {
    huLabel = HU.mainNow ? HU.mainNow.label : "";
    huCmd = HU.mainNow ? HU.mainNow.cmd : "";
    if (HU.mainNow) HU.main.push(huK);
  }
  // {toggle:name}: a class toggle; the label shows its state, the key runs
  // HUNTING TOGGLE. Not lit: the label says ON or OFF, and a lit key read as
  // a ready ability.
  var huTog = huLabel.match(/^\{toggle:(\w+)\}$/);
  var huTogOn = false;
  if (huTog) {
    var huTogDef = (huEntry && huEntry.toggles && huEntry.toggles[huTog[1]]) || {};
    huTogOn = HU.toggles[huTog[1]] === "on";
    huLabel = (huTogDef.label || huTog[1]) + (huTogOn ? " ON" : " OFF");
    huCmd = "hunting toggle " + huTog[1];
  }
  // While the basher is running, F1 is STOP (Ricardo): lit (unless HUNTING
  // HIGHLIGHT OFF), sending BASHER
  // END, which ends the run and leaves the basher primed. Primed or off, F1
  // is the class's own key again; the basher redraws these keys when its run
  // starts or ends.
  if (huK == 1 && client.loom.basher && client.loom.basher.run && !HU.pk) {
    buttons_set_label(1, "STOP");
    buttons_set_commands(1, "basher end");
    buttons_set_highlight(1, get_variable("hunting_highlight") != "off" ? 1 : 0);
    continue;
  }
  huLabel = huLabel.replace("{DRAGON}", huDragon == "gut" ? "Gut" : "Incantation").replace("{MODE}", huMode);
  huCmd = huCmd.replace("{dragon}", huDragon).replace("{staff}", huStaff).replace("{target}", huTarget).replace(/\s+$/, "");
  // Class keys join commands with "|"; Nexus splits a key on the player's
  // own command separator (#410: client._settings.stack_delimiter), so the
  // key gets that one instead.
  var huSep = (client._settings && typeof client._settings.stack_delimiter == "string" && client._settings.stack_delimiter) || "|";
  if (huSep !== "|" && huCmd.indexOf("|") >= 0) huCmd = huCmd.split(/\s*\|\s*/).join(huSep);
  buttons_set_label(huK, huLabel);
  buttons_set_commands(huK, huCmd);
  // The third field is "main", or the ability this key uses when its label
  // is an abbreviation ("SBP" for Spinningbackfist); otherwise the label is
  // the ability name.
  var huAb = (huRow[2] && huRow[2] != "main") ? huRow[2] : huLabel;
  if (HU.costs[huAb] !== undefined) HU.slots[huAb] = huK;
  if (huRow[2] == "main") HU.main.push(huK);
}

if (get_variable("debug") == "on") display_notice("[debug][hunting] buttons for " + (HU.pk ? "PK, " : "") + (HU.cls || "no class") + (HU.spec ? ", spec " + HU.spec : "") + (huEntry ? "" : " (not configured yet: generic keys)"), "cyan");
run_function("hunting_highlight", [], "hunting");
