var S = client.loom.sigils;
var ign = get_variable("sigils_ignored") || {};
var key = S.argv[0] || "";
if (key === "here") key = S.room ? String(S.room.id) : "";
if (key === "") {
  display_notice("[sigils] use SIGILS UNIGNORE HERE or SIGILS UNIGNORE <room id>.", "orange");
} else if (ign[key] !== undefined) {
  delete ign[key];
  set_variable("sigils_ignored", ign);
  if (client.loom.notify) client.loom.notify("sigils");
  display_notice("[sigils] room " + key + " is watched again.", "lime");
} else {
  display_notice("[sigils] room " + key + " was not on the ignore list.", "orange");
}
