var ign = get_variable("mono_ignore");
if (!ign) { ign = { "6742": "?" }; set_variable("mono_ignore", ign); }
var arg = args[1] ? String(args[1]).toLowerCase() : "";

if (arg === "") {
  var keys = Object.keys(ign);
  if (keys.length === 0) display_notice("[eleusis] No rooms ignored.", "cyan");
  else {
    display_notice("[eleusis] " + keys.length + " room(s) ignored:", "cyan");
    var i = 0;
    for (i = 0; i < keys.length; i++) display_notice("  " + ("      " + keys[i]).slice(-6) + "  " + ign[keys[i]], "white");
  }
} else {
  var key = arg;
  var nm = "?";
  if (arg === "here") {
    key = String(get_variable("currentRoomId"));
    nm = get_variable("currentRoomName") || "?";
  }
  var bad = get_variable("mono_bad") || {};
  if (bad[key]) {
    if (nm === "?") nm = bad[key].name;
    delete bad[key];
    set_variable("mono_bad", bad);
  }
  ign[key] = nm;
  set_variable("mono_ignore", ign);
  display_notice("[eleusis] Ignoring room " + key + (nm !== "?" ? " (" + nm + ")" : "") + ".", "cyan");
}
