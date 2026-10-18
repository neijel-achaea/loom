// "You must be wielding a pole to do that.": wield one, unless Loom is
// paused. The cast isn't repeated: cast again once the pole is in hand.
if (get_variable("pauseTriggers") !== "on") {
  send_command("wield pole");
  display_notice("[fishing] no pole in hand: wielding one. Cast again.", "lime");
} else {
  display_notice("[fishing] paused (LOOM PAUSE): not sending wield pole.", "orange");
}
