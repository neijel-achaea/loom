// hunting_dragon_best -- in AUTO dragon mode, attack with GUT while endurance is
// the fuller pool and with INCANTATION while willpower is. Vitals come from
// hunting's own onGMCP.
var HU = client.loom.hunting;
var huDragon = HU.cls == "Black Dragon" || HU.cls == "Blue Dragon";
if (huDragon && get_variable("hunting_dragon_mode") == "auto" && HU.maxep && HU.maxwp) {
  var huAttack = (HU.ep / HU.maxep > HU.wp / HU.maxwp) ? "gut" : "incantation";
  if (huAttack != get_variable("hunting_dragon_attack")) {
    set_variable("hunting_dragon_attack", huAttack);
    if (get_variable("debug") == "on") display_notice("[debug][hunting] dragon attack: " + huAttack, "cyan");
  }
}
