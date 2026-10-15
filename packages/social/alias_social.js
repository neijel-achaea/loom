// SOCIAL [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.social || !client.loom.social.lists) run_function("social_setup", [], "social");
var S = client.loom.social;
var soW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var soSub = soW[0];
var C = "cyan";
var soGroup = soW[1] || "";
var soIsGroup = S.lists[soGroup] !== undefined;

if (soSub === "" || soSub === "status") {
  run_function("social_status", [], "social");
} else if (soSub === "help") {
  run_function("social_help", [], "social");
} else if ((soSub === "add" || soSub === "del") && soW.length == 3) {
  if (!soIsGroup) {
    display_notice("[social] no group '" + soGroup + "'. Groups: " + S.groups.join(", ") + ".", "orange");
  } else if (soSub === "add") {
    S.lists[soGroup][soW[2]] = true;
    run_function("social_save", [], "social");
    display_notice("[social] +" + soW[2] + " -> " + soGroup, S.color[soGroup]);
  } else if (S.lists[soGroup][soW[2]]) {
    delete S.lists[soGroup][soW[2]];
    run_function("social_save", [], "social");
    display_notice("[social] -" + soW[2] + " from " + soGroup, "lime");
  } else {
    display_notice("[social] " + soW[2] + " is not in " + soGroup + ".", "orange");
  }
} else if (soSub === "list") {
  if (soGroup === "") {
    for (var soI = 0; soI < S.groups.length; soI++) display_notice("  " + S.groups[soI] + ": " + Object.keys(S.lists[S.groups[soI]]).length, S.color[S.groups[soI]]);
  } else if (!soIsGroup) {
    display_notice("[social] no group '" + soGroup + "'.", "orange");
  } else {
    var soNames = Object.keys(S.lists[soGroup]).sort();
    display_notice("[social] " + soGroup + " (" + soNames.length + "): " + (soNames.length ? soNames.join(", ") : "empty"), S.color[soGroup]);
  }
} else if (soSub === "color" || soSub === "colour") {
  if (S.defColor[soGroup] === undefined) {
    display_notice("[social] SOCIAL COLOR <group|self> [#rrggbb] (no colour: back to the default).", "orange");
  } else if (soW[2] && /^#[0-9a-f]{6}$/.test(soW[2])) {
    S.color[soGroup] = soW[2];
    run_function("social_save", [], "social");
    display_notice("[social] " + soGroup + " colour " + soW[2] + ".", soW[2]);
  } else if (!soW[2]) {
    S.color[soGroup] = S.defColor[soGroup];
    run_function("social_save", [], "social");
    display_notice("[social] " + soGroup + " colour back to " + S.defColor[soGroup] + ".", S.defColor[soGroup]);
  } else {
    display_notice("[social] colours are #rrggbb, e.g. #ff9f4f.", "orange");
  }
} else if (soSub === "watch" || soSub === "unwatch") {
  if (soGroup === "") {
    var soOn = [], soOff = [];
    for (var soJ = 0; soJ < S.groups.length; soJ++) { if (S.watch[S.groups[soJ]]) soOn.push(S.groups[soJ]); else soOff.push(S.groups[soJ]); }
    display_notice("[social] watching (priority order): " + (soOn.length ? soOn.join(", ") : "none") + "; not watching: " + (soOff.length ? soOff.join(", ") : "none") + ".", C);
  } else if (!soIsGroup) {
    display_notice("[social] no group '" + soGroup + "'.", "orange");
  } else {
    S.watch[soGroup] = (soSub === "watch");
    run_function("social_save", [], "social");
    display_notice("[social] " + (S.watch[soGroup] ? "now watching " : "no longer watching ") + soGroup + ".", "lime");
  }
} else if (soSub === "poll") {
  if (soGroup === "on" || soGroup === "off") {
    set_variable("social_poll", soGroup);
    display_notice("[social] polling " + soGroup.toUpperCase() + ".", C);
  } else if (soGroup === "now") {
    S.reportOnce = true;
    run_function("social_poll", [], "social");
  } else {
    display_notice("[social] polling is " + String(get_variable("social_poll")).toUpperCase() + ". SOCIAL POLL ON|OFF|NOW.", C);
  }
} else if (soSub === "offline") {
  // SOCIAL OFFLINE [ON|OFF]: show or fold the Online tab's Offline section.
  var soOff = (soW[1] || "").toLowerCase();
  if (soOff === "on" || soOff === "off") {
    S.showOffline = soOff === "on";
    set_variable("social_offline", soOff);
    // Also overrides a fold set by clicking the heading this session.
    try { window.loomOnlineOffline = S.showOffline; } catch (e) {}
    display_notice("[social] the Online tab's offline section is " + (S.showOffline ? "shown" : "folded") + ".", "lime");
  } else {
    display_notice("[social] the Online tab's offline section is " + (S.showOffline ? "shown" : "folded") + ". SOCIAL OFFLINE ON or OFF to change it; clicking its heading flips it too.", "cyan");
  }
} else if (soSub === "debug") {
  if (soGroup === "on" || soGroup === "off") {
    S.debug = (soGroup === "on");
    set_variable("social_debug", soGroup);
  }
  display_notice("[social] debug " + (S.debug ? "ON" : "OFF") + " | me " + S.me + " | city " + S.city + " | primed " + (S.prev ? Object.keys(S.prev).length : "no") + " | last count " + S.lastCount + " | timer " + (S.timer ? "set" : "none"), C);
} else if (soSub === "reset") {
  S.prev = null;
  run_function("social_setup", [], "social");
  display_notice("[social] reset: lists reloaded, watchlist re-primes on the next poll.", "lime");
} else {
  display_notice("[social] unknown command '" + soSub + "'. SOCIAL HELP for commands.", "orange");
}
// Lists, colours, watches and polling all show on the Online tab (#76).
if (["add", "del", "color", "colour", "watch", "unwatch", "poll", "reset", "offline"].indexOf(soSub) >= 0) run_function("social_online", [], "social");
