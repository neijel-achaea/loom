// VISION [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.vision) run_function("vision_setup", [], "vision");
var viW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var viSub = viW[0];
var viVal = viW[1] || "";
var viNames = { on: "vision_on", off: "vision_on", hide: "vision_hide", alert: "vision_alert" };
if (viSub === "" || viSub === "status") {
  run_function("vision_status", [], "vision");
} else if (viSub === "help") {
  run_function("vision_help", [], "vision");
} else if (viSub === "on" || viSub === "off") {
  set_variable("vision_on", viSub);
  display_notice("[vision] " + viSub.toUpperCase() + ".", "lime");
} else if ((viSub === "hide" || viSub === "alert") && (viVal === "on" || viVal === "off")) {
  set_variable(viNames[viSub], viVal);
  display_notice("[vision] " + (viSub === "hide" ? "hide city members " : "enemy alerts ") + viVal.toUpperCase() + ".", "lime");
} else if (viSub === "channel" && /^[a-z0-9]+$/.test(viVal)) {
  set_variable("vision_channel", viVal);
  display_notice("[vision] enemy alerts go to " + viVal.toUpperCase() + ".", "lime");
} else if (viSub === "debug") {
  // VISION DEBUG (#137): the settings, social's lists as vision sees them,
  // and what the last alertness line did.
  var viL = client.loom.social && client.loom.social.look;
  var viLa = client.loom.vision.last;
  display_notice("[vision] on=" + get_variable("vision_on") + " hide=" + get_variable("vision_hide") + " alert=" + get_variable("vision_alert") + " channel=" + get_variable("vision_channel")
    + " social=" + (viL && viL.inGroup ? "yes" : "no") + " pause=" + (get_variable("pauseTriggers") === "on" ? "on" : "off")
    + " last=" + (viLa ? viLa.who + " " + viLa.did + " " + Math.round((Date.now() - viLa.at) / 1000) + "s ago" : "none"), "cyan");
} else {
  display_notice("[vision] unknown command '" + viW.join(" ") + "'. VISION HELP for commands.", "orange");
}
