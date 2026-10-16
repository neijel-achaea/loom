// basher_status -- bare BASHER: on or off, what it attacks with, and why it
// isn't attacking right now.
var B = client.loom.basher;
var bsHu = B.hunting();
var bsMain = B.main() ? B.main().name.toUpperCase() : "";
var bsPct = B.maxhp > 0 ? Math.round(B.hp * 100 / B.maxhp) + "%" : "unknown";
if (!bsHu) {
  display_notice("[basher] OFF: needs the hunting package, which isn't installed. BASHER HELP for commands.", "orange");
} else if (B.on && B.run) {
  var bsWhy = B.blocked();
  display_notice("[basher] RUNNING as " + (bsHu.cls || "?") + ": " + (bsMain || "no main attack") + " on " + (B.target().tar || "no target")
    + " — " + (bsWhy || "attacking") + (B.diag ? ", DIAGNOSE owed" : "") + " (sees " + B.seen() + "). Health " + bsPct + ", " + B.wimpyText() + ". Rage " + (get_variable("basher_rage") == "off" ? "OFF" : (bsHu.rage || 0) + ": " + B.rotationText()) + ". BASHER STOP to stop.", "cyan");
} else if (B.on) {
  display_notice("[basher] PRIMED as " + (bsHu.cls || "?") + ": attack something and it carries on with " + (bsMain || "no main attack")
    + " until the room runs out of your target. Sees " + B.seen() + ", target " + (B.target().name || B.target().tar || "none") + ". " + B.wimpyText().charAt(0).toUpperCase() + B.wimpyText().substring(1) + ". Rage " + (get_variable("basher_rage") == "off" ? "OFF" : B.rotationText()) + ". BASHER STOP to stand down.", "cyan");
} else {
  display_notice("[basher] OFF. Attacks your target (tar) with hunting's main attack" + (bsMain ? " (" + bsMain + " as " + bsHu.cls + ")" : "")
    + " once you attack something, until the room runs out of your target; " + B.wimpyText() + ". BASHER ON to prime it, BASHER HELP for commands.", "cyan");
}
