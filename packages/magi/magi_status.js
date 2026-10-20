if (!client.loom || !client.loom.magi || !client.loom.magi.shapes) run_function("magi_setup", [], "magi");
var MG = client.loom.magi;
var mgEl = "";
for (var mgK in MG.staffs) { if (MG.staffs.hasOwnProperty(mgK) && MG.staffs[mgK] === MG.staff) mgEl = mgK; }
display_notice("[magi] staff attack " + (mgEl || MG.staff) + " (" + MG.staff + "); refine " + (MG.state === "idle" ? "idle" : MG.state + (MG.queue.length ? " (" + MG.queue.length + " commands left)" : ""))
  + ", pearl pickup " + String(get_variable("magi_pearls")).toUpperCase()
  + ", portal for city members " + String(get_variable("magi_portal")).toUpperCase() + ", minimum " + MG.defMin + " a shape. MAGI HELP for commands.", "cyan");
if (MG.treaty) {
  display_notice("[magi] forming a treaty with the " + MG.treaty.elemental + " since " + Math.round((Date.now() - MG.treaty.at) / 1000) + "s ago: triggers paused, sipping off. MAGI RESUME if it was interrupted.", "orange");
} else if (get_variable("pauseTriggers") === "on") {
  display_notice("[magi] triggers are paused. MAGI RESUME unpauses them and turns sipping back on.", "orange");
}
