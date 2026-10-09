// hunting_buttons -- lays out the F-key buttons for the current class.
// One row per key: [label, command, main]. "main" lights the key whenever you
// have balance and equilibrium. A key whose label has a battlerage cost in
// HU.costs is tracked for rage highlighting automatically.
// Placeholders filled in below: {dragon}/{DRAGON} gut or incantation,
// {MODE} the dragon mode, {staff} the staff attack (artificing's STAFFATTACK),
// {target} the party target (HUNTING PARTYTARGET).
var HU = client.loom.hunting;
var huQ = "queue add !wu!t!p ";

var huLayouts = {
  "Druid": [
    ["Maul", "queue add b!wu!t!p wreathe | queue add b!wu!t!p maul @tar", false],
    ["Strangle", huQ + "strangle @tar", false],
    ["Ravage", huQ + "ravage @tar", false],
    ["Vinecrack", huQ + "vinecrack @tar", false],
    ["Glare", huQ + "quarterstaff glare @tar", false],
    ["Sting", "queue add b!wu!t sting @tar", false],
    ["Remedy", "evoke remedy {target}", false],
    ["Douse", "freeze ground", false],
    ["{stats}", "", false],
    ["Diag", "diagnose", false],
    ["Barrier", "evoke barrier", false],
    ["Shield", "touch shield", false]
  ],
  "Magi": [
    ["Staff", "queue add e!wu!t!p staff cast {staff} at @tar", true],
    ["Windlash", huQ + "cast windlash at @tar", false],
    ["Squeeze", huQ + "cast squeeze @tar", false],
    ["Disintegrate", huQ + "cast disintegrate at @tar", false],
    ["Firefall", huQ + "cast firefall at @tar", false],
    ["Stormbolt", huQ + "cast stormbolt at @tar", false],
    ["Dilation", huQ + "cast dilation at @tar", false],
    ["Flood", "queue add e cast flood", false],
    ["{stats}", "", false],
    ["Diag", "diagnose", false],
    ["Reflection", "queue add e!wu!t!p cast reflection at me", false],
    ["Shield", "touch shield", false]
  ],
  "Sylvan": [
    ["Thornrend", "queue add e!wu!t!p thornrend @tar", true],
    ["Torrent", huQ + "cast torrent at @tar", false],
    ["Sandstorm", huQ + "cast sandstorm at @tar", false],
    ["Thornpierce", huQ + "thornpierce @tar", false],
    ["Stonevine", huQ + "stonevine @tar", false],
    ["Leechroot", huQ + "leechroot @tar", false],
    ["Rockshot", huQ + "cast rockshot at @tar", false],
    ["Flood", "queue add e cast flood", false],
    ["{stats}", "", false],
    ["Diag", "diagnose", false],
    ["Reflection", "queue add e!wu!t!p cast reflection at me", false],
    ["Shield", "touch shield", false]
  ],
  "Black Dragon": [
    ["{DRAGON}", "queue add eb!wu!t!p {dragon} @tar", true],
    ["Dragonspit", huQ + "dragonspit @tar", false],
    ["Override", huQ + "override @tar", false],
    ["Blast", "queue add eb!wu!t!p blast @tar", true],
    ["Corrode", huQ + "corrode @tar", false],
    ["Dragonsting", huQ + "dragonsting @tar", false],
    ["Dragonfear", huQ + "dragonfear @tar", false],
    ["{MODE}", "hunting dragonmode", false],
    ["{stats}", "", false],
    ["Diag", "diagnose", false],
    ["Dragonheal", "queue add eq!wu!t!p dragonheal", true],
    ["Shield", "touch shield", false]
  ],
  "Blue Dragon": [
    ["{DRAGON}", "queue add eb!wu!t!p {dragon} @tar", true],
    ["Dragonchill", huQ + "dragonchill @tar", false],
    ["Override", huQ + "override @tar", false],
    ["Blast", "queue add eb!wu!t!p blast @tar", true],
    ["Frostwave", huQ + "frostwave @tar", false],
    ["Ague", huQ + "ague @tar", false],
    ["", "", false],
    ["{MODE}", "hunting dragonmode", false],
    ["{stats}", "", false],
    ["Diag", "diagnose", false],
    ["", "", false],
    ["Shield", "touch shield", false]
  ]
};

var huDragon = get_variable("hunting_dragon_attack") || "gut";
var huModes = { physical: "PHY", magical: "MAG", auto: "AUT" };
var huMode = huModes[get_variable("hunting_dragon_mode")] || "AUT";
var huStaff = get_variable("staffAttack") || "scintilla";
var huTarget = get_variable("hunting_party_target") || "";
// F9 opens huntstats when that package is around; otherwise the key stays empty.
// Its saved records count too, as huntstats may load after hunting.
var huStats = (client.loom.registry && client.loom.registry.huntstats) || get_variable("huntstats_log") || client.track || get_variable("hs_log");

// A class with no layout yet gets the generic keys only.
var huGeneric = [["", "", false], ["", "", false], ["", "", false], ["", "", false], ["", "", false], ["", "", false], ["", "", false], ["", "", false], ["{stats}", "", false], ["Diag", "diagnose", false], ["", "", false], ["Shield", "touch shield", false]];
var huRows = huLayouts[HU.cls] || huGeneric;
HU.slots = {};
HU.main = [];

for (var huK = 1; huK <= 12; huK++) {
  buttons_set_highlight(huK, 0);
  var huRow = huRows[huK - 1] || ["", "", false];
  var huLabel = huRow[0];
  var huCmd = huRow[1];
  if (huLabel == "{stats}") {
    huLabel = huStats ? "Stats" : "";
    huCmd = huStats ? "huntstats" : "";
  }
  huLabel = huLabel.replace("{DRAGON}", huDragon == "gut" ? "Gut" : "Incantation").replace("{MODE}", huMode);
  huCmd = huCmd.replace("{dragon}", huDragon).replace("{staff}", huStaff).replace("{target}", huTarget).replace(/\s+$/, "");
  buttons_set_label(huK, huLabel);
  buttons_set_commands(huK, huCmd);
  if (HU.costs[huLabel] !== undefined) HU.slots[huLabel] = huK;
  if (huRow[2]) HU.main.push(huK);
}

if (get_variable("debug") == "on") display_notice("[debug][hunting] buttons for " + (HU.cls || "no class") + (huLayouts[HU.cls] ? "" : " (not configured: generic keys)"), "cyan");
run_function("hunting_highlight", [], "hunting");
