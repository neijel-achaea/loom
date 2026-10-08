// A new yearly record: tell the party, if FISHING DING is on and Loom isn't paused.
if (get_variable("fishing_ding") !== "off") {
  if (get_variable("pauseTriggers") !== "on") {
    send_command("partytell Ding fish!");
  } else {
    display_notice("[fishing] paused (LOOM PAUSE): not telling the party.", "orange");
  }
}
