// DEFCON [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.defcon || !client.loom.defcon.classes) run_function("defcon_setup", [], "defcon");
var D = client.loom.defcon;
var dcRaw = String(args[1] || "").trim().toLowerCase();
var dcParts = dcRaw.split(/\s+/);
var dcSub = dcParts[0];
var dcVal = dcParts[1] || "";
// Everything after the subcommand, for commands that take free text.
var dcRest = dcRaw.replace(/^\S+\s*/, "");
var C = "cyan";

if (dcSub === "" || dcSub === "status") {
  run_function("defcon_status", [], "defcon");
}
else if (dcSub === "help") {
  run_function("defcon_help", [], "defcon");
}
else if (/^[1-5]$/.test(dcSub)) {
  D.want = parseInt(dcSub, 10);
  run_function("defcon_set", [], "defcon");
}
else if (/^\d+$/.test(dcSub)) {
  display_notice("[defcon] levels go from 1 (all defences) to 5 (fewest).", "orange");
}
else if (dcSub === "init" && (dcVal === "add" || dcVal === "remove")) {
  D.edit = { verb: "init", words: dcParts.slice(1), rest: dcRest };
  run_function("defcon_edit", [], "defcon");
}
else if (dcSub === "aftermorph") {
  D.edit = { verb: "aftermorph", words: dcParts.slice(1), rest: dcRest };
  run_function("defcon_edit", [], "defcon");
}
else if ((dcSub === "init" && dcVal === "auto") || dcSub === "autoup") {
  // DEFCON INIT AUTO ON|OFF (DEFCON AUTOUP until 0.5.0).
  var dcOnOff = dcSub === "autoup" ? dcVal : (dcParts[2] || "");
  if (dcSub === "autoup") display_notice("[defcon] DEFCON AUTOUP is now DEFCON INIT AUTO.", "orange");
  if (dcOnOff === "on" || dcOnOff === "off") {
    set_variable("defcon_autoinit", dcOnOff);
    display_notice("[defcon] init at login " + dcOnOff.toUpperCase() + ": your class's init commands " + (dcOnOff === "on" ? "are" : "aren't") + " sent when you log in.", C);
  } else {
    display_notice("[defcon] init at login is " + String(get_variable("defcon_autoinit")).toUpperCase() + ". DEFCON INIT AUTO ON or OFF.", C);
  }
}
else if (dcSub === "init" || dcSub === "up") {
  // DEFCON INIT (DEFCON UP until 0.5.0): send the class's init commands now.
  if (dcSub === "up") display_notice("[defcon] DEFCON UP is now DEFCON INIT.", "orange");
  run_function("defcon_up", [], "defcon");
}
else if (dcSub === "add" || dcSub === "set" || dcSub === "remove" || dcSub === "reset") {
  D.edit = { verb: dcSub, words: dcParts.slice(1), rest: dcRest };
  run_function("defcon_edit", [], "defcon");
}
else if (dcSub === "export") {
  run_function("defcon_export", [], "defcon");
}
else if (dcSub === "on" || dcSub === "off") {
  send_command("curing defences " + dcSub);
  display_notice("[defcon] defence upkeep " + dcSub.toUpperCase() + ".", C);
}
else if (dcSub === "list") {
  run_function("defcon_list", [], "defcon");
}
else if (dcSub === "debug") {
  display_notice("[defcon] cls=" + D.cls + " upDone=" + D.upDone + " levels=" + JSON.stringify(D.levels) + " custom=" + JSON.stringify(D.custom) + " queue=" + JSON.stringify(D.queue) + " timer=" + (D.timer ? "running" : "none"), C);
}
else {
  display_notice("[defcon] unknown command '" + dcSub + "'. DEFCON HELP for commands.", "orange");
}
