// "You cease your transformation into Dragonform." (Ricardo): the change was
// interrupted, so no roar will come. Resume the packages the start paused.
if (get_variable("pauseTriggers") == "on") {
  set_variable("pauseTriggers", "off");
  display_notice("[hunting] dragonform interrupted: Loom resumes.", "cyan");
}
