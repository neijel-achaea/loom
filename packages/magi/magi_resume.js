// magi_resume -- after a treaty: triggers unpaused and sipping back on.
// Run by the treaty's closing lines and by MAGI RESUME.
if (!client.loom || !client.loom.magi || !client.loom.magi.shapes) run_function("magi_setup", [], "magi");
client.loom.magi.treaty = null;
set_variable("pauseTriggers", "off");
send_command("curing sipping on");
