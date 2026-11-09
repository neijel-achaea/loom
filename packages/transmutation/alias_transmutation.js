// TRANSMUTATION [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.transmutation || !client.loom.transmutation.envs) run_function("transmutation_setup", [], "transmutation");
var TR = client.loom.transmutation;
var trRaw = String(args[1] || "").trim();
var trA = trRaw.toLowerCase().split(/\s+/);
if (trA[0] === "" || trA[0] === "status") {
  run_function("transmutation_status", [], "transmutation");
} else if (trA[0] === "help") {
  run_function("transmutation_help", [], "transmutation");
} else if (trA[0] === "on") {
  TR.on = true;
  TR.started = true;
  TR.wantRead = true;
  TR.decide();
  TR.say("ON: reading your rift (IR MINERALS), then extracting what's short in each mountain or underground room you enter.", "lime");
} else if (trA[0] === "off") {
  TR.on = false;
  TR.want = null;
  TR.current = null;
  TR.probing = null;
  TR.reading = false;
  TR.wantRead = false;
  TR.say("OFF.", "lime");
} else if (trA[0] === "stock") {
  TR.reading = true;
  TR.sentAt = Date.now();
  send_command("ir minerals");
} else if (trA[0] === "min" && trA.length == 2 && /^\d+$/.test(trA[1])) {
  TR.defMin = parseInt(trA[1], 10);
  set_variable("transmutation_default_min", TR.defMin);
  if (client.loom.notify) client.loom.notify("transmutation");
  TR.say("default minimum: " + TR.defMin + ".", "lime");
} else if (trA[0] === "min" && trA.length == 3 && (trA[2] === "default" || /^\d+$/.test(trA[2])) && TR.known(trA[1])) {
  if (trA[2] === "default") delete TR.min[trA[1]];
  else TR.min[trA[1]] = parseInt(trA[2], 10);
  TR.save();
  TR.decide();
  TR.say("minimum for " + trA[1] + ": " + (TR.min[trA[1]] != null ? TR.min[trA[1]] : TR.defMin + " (default)") + ".", "lime");
} else if (trA[0] === "min" && trA.length == 3) {
  TR.say("'" + trA[1] + "' isn't a mineral (HELP MINERALS lists them).", "orange");
} else if (trA[0] === "min") {
  TR.say("TRANSMUTATION MIN <n>, or TRANSMUTATION MIN <mineral> <n|DEFAULT>.", "orange");
} else if (trA[0] === "areas") {
  set_variable("transmutation_arg", trA[1] || "");
  run_function("transmutation_areas", [], "transmutation");
  delete_variable("transmutation_arg");
} else if (trA[0] === "forget") {
  // FORGET HERE | <area> [CONFIRM]: the area's mineral is looked up again.
  var trConfirm = trA[trA.length - 1] === "confirm";
  var trName = trRaw.replace(/^\S+\s*/, "").replace(/\s*confirm$/i, "").trim();
  var trArea = "";
  if (trName.toLowerCase() === "here") trArea = TR.area;
  else for (var trK in TR.areas) { if (TR.areas.hasOwnProperty(trK) && trK.toLowerCase() === trName.toLowerCase()) trArea = trK; }
  if (!trName) {
    TR.say("TRANSMUTATION FORGET HERE, or FORGET <area>, then CONFIRM.", "orange");
  } else if (!trArea || TR.areas[trArea] === undefined) {
    TR.say("no mineral known for '" + (trArea || trName) + "'. TRANSMUTATION AREAS lists the areas known.", "orange");
  } else if (!trConfirm) {
    TR.say("this forgets that " + trArea + " gives " + (TR.areas[trArea] || "no minerals") + "; it is looked up again with MINERALS. TRANSMUTATION FORGET " + trName.toUpperCase() + " CONFIRM to do it.", "orange");
  } else {
    delete TR.areas[trArea];
    delete TR.noneSeen[trArea];
    for (var trR in TR.asked) { if (TR.asked.hasOwnProperty(trR)) delete TR.asked[trR]; }
    TR.save();
    if (trArea == TR.area) TR.decide();
    TR.say("forgot " + trArea + ".", "lime");
  }
} else if (trA[0] === "reset") {
  TR.want = null;
  TR.current = null;
  TR.probing = null;
  TR.reading = false;
  TR.wantRead = false;
  TR.done = {};
  TR.asked = {};
  TR.noneSeen = {};
  run_function("transmutation_setup", [], "transmutation");
  TR.decide();
  TR.say("reset: what's out cleared, rooms extracted this session forgotten, state reloaded from saved variables.", "lime");
} else if (trA[0] === "debug") {
  TR.say("on=" + TR.on + " here=" + TR.here + " area=" + TR.area + " room=" + TR.room + " want=" + JSON.stringify(TR.want) + " current=" + JSON.stringify(TR.current) + " probing=" + JSON.stringify(TR.probing) + " reading=" + TR.reading + " wantRead=" + TR.wantRead + " bal=" + TR.bal + " eq=" + TR.eq + " waitingOn=" + (TR.othersBusy() || "-") + " noneSeen=" + JSON.stringify(TR.noneSeen) + " done=" + Object.keys(TR.done).length + " rooms");
} else {
  TR.say("unknown command '" + trA[0] + "'. TRANSMUTATION HELP for commands.", "orange");
}
