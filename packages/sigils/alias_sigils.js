// SIGILS [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.sigils) run_function("sigils_setup", [], "sigils");
var S = client.loom.sigils;
var raw = String(args[1] || "").trim();
var parts = raw.split(/\s+/);
var sub = String(parts[0] || "").toLowerCase();
S.argv = [];
for (var i = 1; i < parts.length; i++) S.argv.push(String(parts[i]).toLowerCase());

if (sub === "" || sub === "status") run_function("sigils_status", [], "sigils");
else if (sub === "help") run_function("sigils_help", [], "sigils");
else if (sub === "watch") run_function("sigils_watch", [], "sigils");
else if (sub === "report") run_function("sigils_report", [], "sigils");
else if (sub === "ignore") run_function("sigils_ignore", [], "sigils");
else if (sub === "unignore") run_function("sigils_unignore", [], "sigils");
else if (sub === "threshold") run_function("sigils_threshold", [], "sigils");
else if (sub === "cost") run_function("sigils_cost", [], "sigils");
else if (sub === "check") {
  var was = get_variable("sigils_on");
  set_variable("sigils_on", true);
  run_function("sigils_enter", [], "sigils");
  set_variable("sigils_on", was);
}
else if (sub === "clear") {
  set_variable("sigils_flagged", {});
  S.queue = [];
  S.await = null;
  display_notice("[sigils] list cleared.", "lime");
}
else if (sub === "reset") {
  run_function("sigils_setup", [], "sigils");
  display_notice("[sigils] reset: queue cleared, missing defaults restored. Flagged and ignored rooms are kept.", "lime");
}
else if (sub === "debug") {
  display_notice("[sigils] on=" + get_variable("sigils_on")
    + " thr=" + get_variable("sigils_threshold")
    + " flagged=" + Object.keys(get_variable("sigils_flagged") || {}).length
    + " ignored=" + Object.keys(get_variable("sigils_ignored") || {}).join(",")
    + " queue=" + JSON.stringify(S.queue)
    + " await=" + JSON.stringify(S.await)
    + " room=" + JSON.stringify(S.room)
    + " city=" + (S.city || "?"), "cyan");
}
else display_notice("[sigils] unknown command '" + sub + "'. SIGILS HELP for commands.", "orange");
