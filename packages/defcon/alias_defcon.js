// DEFCON [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.defcon || !client.loom.defcon.classes) run_function("defcon_setup", [], "defcon");
var D = client.loom.defcon;
var dcRaw = String(args[1] || "").trim().toLowerCase();
var dcParts = dcRaw.split(/\s+/);
var dcSub = dcParts[0];
var dcVal = dcParts[1] || "";
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
else if (dcSub === "up") {
  run_function("defcon_up", [], "defcon");
}
else if (dcSub === "curing") {
  if (dcVal === "on" || dcVal === "off") {
    send_command("curing defences " + dcVal);
  } else {
    display_notice("[defcon] DEFCON CURING ON or OFF switches the game's defence upkeep.", "orange");
  }
}
else if (dcSub === "autoup") {
  if (dcVal === "on" || dcVal === "off") {
    set_variable("defcon_autoup", dcVal);
    display_notice("[defcon] autoup " + dcVal.toUpperCase() + ": defences " + (dcVal === "on" ? "go up" : "stay as they are") + " when you log in.", C);
  } else {
    display_notice("[defcon] autoup is " + String(get_variable("defcon_autoup")).toUpperCase() + ". DEFCON AUTOUP ON or OFF.", C);
  }
}
else if (dcSub === "list") {
  run_function("defcon_table", [], "defcon");
  var dcLvl = to_number(get_variable("defcon_level")) || 5;
  display_notice("[defcon] " + D.tbl.name + (D.tbl.known ? "" : " (general defences)") + ", tier: defence (priority)", C);
  for (var dcT = 1; dcT <= 5; dcT++) {
    var dcRow = [];
    for (var dcI = 0; dcI < D.tbl.defs.length; dcI++) {
      if (D.tbl.defs[dcI][1] === dcT) dcRow.push(D.tbl.defs[dcI][0] + " (" + D.tbl.defs[dcI][2] + ")");
    }
    display_notice("  " + dcT + (dcT >= dcLvl ? " up   " : " down ") + dcRow.join(", "), dcT >= dcLvl ? "lime" : C);
  }
}
else if (dcSub === "debug") {
  display_notice("[defcon] cls=" + D.cls + " upDone=" + D.upDone + " level=" + get_variable("defcon_level") + " queue=" + JSON.stringify(D.queue) + " timer=" + (D.timer ? "running" : "none"), C);
}
else {
  display_notice("[defcon] unknown command '" + dcSub + "'. DEFCON HELP for commands.", "orange");
}
