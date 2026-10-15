var S = client.loom.sigils;
var ign = get_variable("sigils_ignored") || {};
var arg = S.argv[0] || "";

if (arg === "") {
  var keys = Object.keys(ign);
  if (keys.length === 0) display_notice("[sigils] no rooms ignored.", "cyan");
  else {
    display_notice("[sigils] " + keys.length + " room(s) ignored:", "cyan");
    for (var i = 0; i < keys.length; i++) display_notice("  " + ("      " + keys[i]).slice(-6) + "  " + ign[keys[i]], "white");
  }
} else if (arg !== "here" && !/^\d+$/.test(arg)) {
  display_notice("[sigils] use SIGILS IGNORE HERE or SIGILS IGNORE <room id>.", "orange");
} else {
  var key = arg;
  var nm = "?";
  if (arg === "here") {
    if (!S.room) { display_notice("[sigils] no room seen yet; move once and try again.", "orange"); key = ""; }
    else { key = String(S.room.id); nm = S.room.name || "?"; }
  }
  if (key !== "") {
    var bad = get_variable("sigils_flagged") || {};
    if (bad[key]) {
      if (nm === "?") nm = bad[key].name;
      delete bad[key];
      set_variable("sigils_flagged", bad);
    }
    ign[key] = nm;
    set_variable("sigils_ignored", ign);
    if (client.loom.notify) client.loom.notify("sigils");
    display_notice("[sigils] ignoring room " + key + (nm !== "?" ? " (" + nm + ")" : "") + ".", "lime");
  }
}
