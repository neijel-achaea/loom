// ROLEPLAY [subcommand ...]: settings, the ambient emotes and help. The emotes
// and rituals keep their own aliases (see ROLEPLAY HELP).
if (!client.loom || !client.loom.roleplay || client.loom.roleplay.cls === undefined) run_function("roleplay_setup", [], "roleplay");
var RP = client.loom.roleplay;
var rpW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var rpSub = rpW[0];
var rpP1 = rpW[1] || "";
function rpSay(t, c) { display_notice("[roleplay] " + t, c || "cyan"); }
function rpOn() { return get_variable("roleplay_aem_on") === "1"; }

if (rpSub === "" || rpSub === "status") {
  rpSay("emotes follow your class: " + (RP.cls || "not known yet (log in once)") + ".", RP.cls ? "cyan" : "orange");
  if (!RP.aem && rpOn()) run_function("roleplay_aem", [], "roleplay");
  rpSay("ambient emotes: " + (rpOn() ? "on" : "off") + (RP.aem && !RP.aem.has ? " (none written for this class)" : "") + ". ROLEPLAY AEM ON/OFF/NOW. custom_emotes lists the emotes; ROLEPLAY HELP for the rest.");
} else if (rpSub === "help") {
  run_function("roleplay_help", [], "roleplay");
} else if (rpSub === "aem") {
  if (rpP1 === "on") {
    set_variable("roleplay_aem_on", "1");
    run_function("roleplay_aem", [], "roleplay");
    rpSay(RP.aem.has ? "ambient emotes on: one every 15-19 minutes." : "ambient emotes on, but none are written for " + (RP.cls || "this class") + " yet.", RP.aem.has ? "cyan" : "orange");
  } else if (rpP1 === "off") {
    set_variable("roleplay_aem_on", "0");
    if (RP.aem) { try { clearTimeout(RP.aem.timer); } catch (e) {} }
    rpSay("ambient emotes off.");
  } else if (rpP1 === "now") {
    if (!RP.aem || RP.aem.cls !== RP.cls) run_function("roleplay_aem", [], "roleplay");
    if (!RP.aem.has) rpSay("no ambient emotes are written for " + (RP.cls || "this class") + ".", "orange");
    else if (get_variable("pauseTriggers") === "on") rpSay("triggers are paused, so nothing was sent.", "orange");
    else { send_command(RP.aem.pick()); if (rpOn()) RP.aem.schedule(); }
  } else if (rpP1 === "reload") {
    run_function("roleplay_aem", [], "roleplay");
    rpSay("ambient emotes rebuilt for " + (RP.cls || "no class") + (rpOn() ? ", and running." : "."));
  } else {
    rpSay("ambient emotes: " + (rpOn() ? "on" : "off") + ". ROLEPLAY AEM ON, OFF, NOW or RELOAD.");
  }
} else if (rpSub === "debug") {
  rpSay("cls=" + RP.cls + " saved=" + get_variable("roleplay_class") + " aem_on=" + get_variable("roleplay_aem_on") + " engine=" + (RP.aem ? RP.aem.cls + " has=" + RP.aem.has + " timer=" + !!RP.aem.timer : "none") + " pause=" + (get_variable("pauseTriggers") || "unset"), "orange");
} else {
  rpSay("unknown command '" + rpSub + "'. ROLEPLAY HELP for commands.", "orange");
}
