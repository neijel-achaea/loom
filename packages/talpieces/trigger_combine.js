// A level 1-6 piece row of your listing: queue TALISMAN COMBINE for it
// (args[1] = level, args[2] = keyword), unless COMBINE is off or Loom is paused.
if (get_variable("talpieces_combine") !== "off" && get_variable("pauseTriggers") !== "on") {
  send_command("queue add eqbal talisman combine " + args[2] + " " + args[1]);
}
