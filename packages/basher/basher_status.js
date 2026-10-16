// basher_status -- bare BASHER: on or off, what it attacks with, and why it
// isn't attacking right now.
var B = client.loom.basher;
var bsHu = B.hunting();
var bsMain = B.main() ? B.main().name.toUpperCase() : "";
var bsMin = get_variable("basher_health");
var bsPct = B.maxhp > 0 ? Math.round(B.hp * 100 / B.maxhp) + "%" : "unknown";
if (!bsHu) {
  display_notice("[basher] OFF: needs the hunting package, which isn't installed. BASHER HELP for commands.", "orange");
} else if (B.on) {
  var bsWhy = B.blocked();
  display_notice("[basher] ON as " + (bsHu.cls || "?") + ": " + (bsMain || "no main attack") + " on " + (B.target().tar || "no target")
    + " — " + (bsWhy || "attacking") + ". Holds below " + bsMin + "% health (now " + bsPct + "). BASHER OFF to stop.", "cyan");
} else {
  display_notice("[basher] OFF. Attacks your target (tar) with hunting's main attack" + (bsMain ? " (" + bsMain + " as " + bsHu.cls + ")" : "")
    + " on balance and equilibrium; holds below " + bsMin + "% health. BASHER ON to start, BASHER HELP for commands.", "cyan");
}
