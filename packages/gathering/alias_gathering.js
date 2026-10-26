// GATHERING [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.gathering || !client.loom.gathering.envs) run_function("gathering_setup", [], "gathering");
var GA = client.loom.gathering;
var gaA = String(args[1] || "").toLowerCase().trim().split(/\s+/);
if (gaA[0] === "" || gaA[0] === "status") {
  run_function("gathering_status", [], "gathering");
} else if (gaA[0] === "help") {
  run_function("gathering_help", [], "gathering");
} else if (gaA[0] === "on") {
  GA.on = true;
  GA.started = true;
  GA.wantRead = true;
  GA.room(GA.here);
  GA.wantRead = true;
  GA.sentAt = Date.now();
  display_notice("[gathering] ON: reading your rift stock (IR INGREDIENTS), then gathering what's short in each room you enter.", "lime");
} else if (gaA[0] === "off") {
  GA.on = false;
  GA.queue = [];
  GA.current = null;
  GA.reading = false;
  GA.wantRead = false;
  display_notice("[gathering] OFF.", "lime");
} else if (gaA[0] === "stock") {
  GA.reading = true;
  GA.sentAt = Date.now();
  send_command("ir ingredients");
} else if (gaA[0] === "min" && gaA.length == 2 && /^\d+$/.test(gaA[1])) {
  GA.defMin = parseInt(gaA[1], 10);
  set_variable("gathering_default_min", GA.defMin);
  if (client.loom.notify) client.loom.notify("gathering");
  display_notice("[gathering] default minimum: " + GA.defMin + ".", "lime");
} else if (gaA[0] === "min" && gaA.length == 3 && (gaA[2] === "default" || /^\d+$/.test(gaA[2])) && GA.known(GA.name(gaA[1]))) {
  var gaM = GA.name(gaA[1]);
  if (gaA[2] === "default") delete GA.min[gaM];
  else GA.min[gaM] = parseInt(gaA[2], 10);
  GA.save();
  display_notice("[gathering] minimum for " + gaM + ": " + (GA.min[gaM] != null ? GA.min[gaM] : GA.defMin + " (default)") + ".", "lime");
} else if (gaA[0] === "min" && gaA.length == 3) {
  display_notice("[gathering] '" + gaA[1] + "' isn't a material gathering knows. GATHERING HELP lists them.", "orange");
} else if (gaA[0] === "min") {
  display_notice("[gathering] GATHERING MIN <n>, or GATHERING MIN <material> <n|DEFAULT>.", "orange");
} else if (gaA[0] === "reset") {
  GA.queue = [];
  GA.current = null;
  GA.reading = false;
  GA.wantRead = false;
  run_function("gathering_setup", [], "gathering");
  display_notice("[gathering] reset: queue cleared, state reloaded from saved variables.", "lime");
} else if (gaA[0] === "debug") {
  display_notice("[gathering] on=" + GA.on + " here=" + GA.here + " queue=" + JSON.stringify(GA.queue) + " current=" + GA.current + " reading=" + GA.reading + " wantRead=" + GA.wantRead + " bal=" + GA.bal + " eq=" + GA.eq + " waitingOn=" + (GA.othersBusy() || "-") + " rttMin=" + GA.rttMin + " lastFail=" + JSON.stringify(GA.lastFail) + " map=" + JSON.stringify(GA.map), "cyan");
} else {
  display_notice("[gathering] unknown command '" + gaA[0] + "'. GATHERING HELP for commands.", "orange");
}
