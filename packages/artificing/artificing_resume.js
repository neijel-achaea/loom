// artificing_resume -- after a treaty: triggers unpaused and sipping back on.
// Run by the treaty's closing lines and by ARTIFICING RESUME.
if (!client.loom || !client.loom.artificing || !client.loom.artificing.staffs) run_function("artificing_setup", [], "artificing");
client.loom.artificing.treaty = null;
set_variable("pauseTriggers", "off");
send_command("curing sipping on");
