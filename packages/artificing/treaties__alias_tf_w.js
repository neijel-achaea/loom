var elemental = args[1];

if (elemental != "waterweird" && elemental != "djinn" && elemental != "sandling" && elemental != "efreeti" && elemental != "stoneback" && elemental != "breath" && elemental != "mistfiend" && elemental != "ashbeast") {
  display_notice("[artificing] You can only form treaties with these elementals: WATERWEIRD, DJINN, SANDLING, EFREETI, STONEBACK, BREATH, MISTFIEND, ASHBEAST", "cyan");
} else {
    set_variable("pauseTriggers", "on");
    send_command("curing sipping off");
    send_command("treaty form " + elemental);
}