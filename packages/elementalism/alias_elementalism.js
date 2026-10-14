// ELEMENTALISM [subcommand ...]: settings and help. The illusions and set
// pieces keep their own aliases (ILLUSION, FEEL_<environment>, PINK_DRAGON,
// KAWHEDRAGON_F/M).
if (!client.loom || !client.loom.elementalism || !client.loom.elementalism.pronouns) run_function("elementalism_setup", [], "elementalism");
var EL = client.loom.elementalism;
var elW = String(args[1] || "").trim().split(/\s+/);
var elSub = (elW[0] || "").toLowerCase();
var elP1 = elW[1] || "";
function elSay(t, c) { display_notice("[elementalism] " + t, c || "cyan"); }

if (elSub === "" || elSub === "status") {
  elSay("set pieces use " + (EL.name ? EL.name : "(no name yet: log in once, or ELEMENTALISM NAME <name>)") + ", " + EL.pron + ".", EL.name ? "cyan" : "orange");
  elSay("illusions: ILLUSION MOSSTATTOO [target], FEEL_<desert|forest|grassland|hill|jungle|mountain|swamp|underground|valley|water>; set pieces: PINK_DRAGON, KAWHEDRAGON_F/M <name> <1-11>. ELEMENTALISM HELP for more.");
} else if (elSub === "help") {
  run_function("elementalism_help", [], "elementalism");
} else if (elSub === "name") {
  if (!elP1) {
    elSay(EL.name ? "set pieces use " + EL.name + "." : "no name yet. ELEMENTALISM NAME <name>, or log in once.");
  } else {
    EL.name = elP1.charAt(0).toUpperCase() + elP1.slice(1);
    set_variable("elementalism_name", EL.name);
    elSay("set pieces use " + EL.name + ".", "lime");
  }
} else if (elSub === "pronouns") {
  var elPr = elP1.toLowerCase();
  if (!EL.pronouns[elPr]) {
    elSay("pronouns: " + EL.pron + ". ELEMENTALISM PRONOUNS HE, SHE or THEY.", elP1 ? "orange" : "cyan");
  } else {
    EL.pron = elPr;
    set_variable("elementalism_pronouns", elPr);
    elSay("pronouns: " + elPr + ".", "lime");
  }
} else if (elSub === "debug") {
  elSay("name=" + EL.name + " pron=" + EL.pron + " saved=" + get_variable("elementalism_name") + "/" + get_variable("elementalism_pronouns"), "orange");
} else {
  elSay("unknown command '" + elSub + "'. ELEMENTALISM HELP for commands.", "orange");
}
