var ign = get_variable("mono_ignore") || {};
var key = String(args[1]).toLowerCase();
if (key === "here") key = String(get_variable("currentRoomId"));
if (ign[key] !== undefined) {
  delete ign[key];
  set_variable("mono_ignore", ign);
  display_notice("[eleusis] Room " + key + " is watched again.", "cyan");
} else {
  display_notice("[eleusis] Room " + key + " was not on the ignore list.", "orange");
}
