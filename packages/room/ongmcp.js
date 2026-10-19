// Everything on the Here tab comes from GMCP: Room.Info for the room, Room.Players
// and Add/RemovePlayer for who's here, Char.Items (location "room") for mobs and
// items. A room change sends several of these in a row, so the tab is drawn
// once, 50ms after the last of them.
var rmM = "";
var rmA = null;
try { rmM = args.gmcp_method; rmA = args.gmcp_args; } catch (e) { rmM = ""; }
if (typeof rmA === "string") { try { rmA = JSON.parse(rmA); } catch (e) { /* a bare name, as RemovePlayer may send */ } }
var rmMine = /^Room\.(Info|Players|AddPlayer|RemovePlayer)$/.test(rmM) || rmM === "IRE.Target.Info" || rmM === "IRE.Target.Set" || rmM === "Char.Vitals" || (/^Char\.Items\.(List|Add|Remove|Update)$/.test(rmM) && rmA && rmA.location === "room") || rmM === "Char.Name" || rmM === "Char.Status";
if (rmMine) {
  if (!client.loom || !client.loom.room || !client.loom.room.raw) run_function("room_setup", [], "room");
  var R = client.loom.room;
  if (rmM !== "Char.Status" && rmM !== "Char.Vitals") R.raw[rmM] = rmA;
  var rmDraw = true;
  if (rmM === "Room.Info" && rmA) {
    R.info = rmA;
    // A move: probes wait for this room's exits line (trigger room exits line).
    R.probeHold = "room";
    R.probeHoldN = 0;
  } else if (rmM === "Room.Players" && rmA && rmA.length !== undefined) {
    R.players = {};
    var rmNew = false;
    for (var rmI = 0; rmI < rmA.length; rmI++) { if (rmA[rmI] && rmA[rmI].name) { R.players[rmA[rmI].name] = rmA[rmI].fullname || rmA[rmI].name; if (R.seen(rmA[rmI].name, rmA[rmI].fullname)) rmNew = true; } }
    if (rmNew) { R.saveNewbies(); if (client.loom.notify) client.loom.notify("room"); }
  } else if (rmM === "Room.AddPlayer" && rmA && rmA.name) {
    R.players[rmA.name] = rmA.fullname || rmA.name;
    if (R.seen(rmA.name, rmA.fullname)) { R.saveNewbies(); if (client.loom.notify) client.loom.notify("room"); }
  } else if (rmM === "Room.RemovePlayer" && rmA) {
    delete R.players[typeof rmA === "string" ? rmA : rmA.name];
  } else if (rmM === "Char.Items.List") {
    R.items = {};
    // R.order: the ids in the game's own order (Char.Items.List, then each
    // Add at the end). R.items alone would iterate by id, since JavaScript
    // walks number-like keys in ascending order, and the room's order is
    // what targeting by name follows.
    R.order = [];
    var rmL = rmA.items || [];
    for (var rmJ = 0; rmJ < rmL.length; rmJ++) { R.items[rmL[rmJ].id] = rmL[rmJ]; R.order.push(String(rmL[rmJ].id)); R.probeAdd(rmL[rmJ]); }
  } else if ((rmM === "Char.Items.Add" || rmM === "Char.Items.Update") && rmA.item) {
    if (!R.order) R.order = [];
    if (!R.items[rmA.item.id]) R.order.push(String(rmA.item.id));
    R.items[rmA.item.id] = rmA.item;
    R.probeAdd(rmA.item);
  } else if (rmM === "Char.Items.Remove" && rmA.item !== undefined) {
    var rmRid = String(typeof rmA.item === "object" ? rmA.item.id : rmA.item);
    delete R.items[rmRid];
    if (R.order) { var rmAt = R.order.indexOf(rmRid); if (rmAt >= 0) R.order.splice(rmAt, 1); }
  } else if (rmM === "IRE.Target.Info" && rmA) {
    // Your target, for the glow on its mob: its id, and its health. Later
    // updates for the same target can carry only the health.
    var rmTi = String(rmA.id || "");
    var rmTn = String(rmA.short_desc || "");
    if (!rmTn && R.target && R.target.id === rmTi) rmTn = R.target.name || "";
    R.target = { id: rmTi, name: rmTn, hp: String(rmA.hpperc || "").replace("%", ""), at: Date.now() };
  } else if (rmM === "IRE.Target.Set") {
    // The game announcing a new target (ST/SETTARGET; Ricardo, #205: a
    // player stayed lit after ST RAT). The payload is the target as typed or
    // an id, maybe quoted; empty means none. Health comes with Info later.
    var rmTs = String(rmA === null || rmA === undefined ? "" : (typeof rmA === "object" ? (rmA.target || rmA.id || "") : rmA)).replace(/^"|"$/g, "").trim();
    R.target = rmTs ? { id: rmTs, name: "", hp: "", at: Date.now() } : { id: "", name: "", hp: "", none: true, at: Date.now() };
  } else if (rmM === "Char.Vitals") {
    // Every prompt: redraw only if the tar variable changed (ST, or a
    // targeting alias), since that sends nothing of its own.
    rmDraw = false;
    // A probe whose answer is past its health line ends here; otherwise a
    // mob that arrived where you stand may be probed now (a moved-into room
    // waits for its exits line instead).
    // The second prompt after a move lifts the hold too (no exits line seen:
    // blind, or a display that leaves it out).
    if (R.probeHold && ++R.probeHoldN >= 2) R.probeHold = "";
    if (!R.probePrompt()) R.probeNext();
    // GMCP can come ahead of its packet's text: an answer another package
    // was waiting for may be in this same packet, so look again once the
    // packet's lines are read (not a time gate: busy() decides).
    if (!R.probing && R.probeQ.length && R.probeWaitOn && R.probeWaitOn.length) {
      clearTimeout(R.probeLater);
      R.probeLater = setTimeout(function () { R.probeNext(); }, 0);
    }
    var rmTar = String(get_variable("tar") || "");
    if (rmTar !== R.lastTar) { R.lastTar = rmTar; R.tarAt = Date.now(); rmDraw = true; }
  } else if ((rmM === "Char.Name" || rmM === "Char.Status") && rmA && rmA.name) {
    rmDraw = false;
    if (String(rmA.name) !== R.me) { R.me = String(rmA.name); try { set_variable("room_name", R.me); } catch (e) {} rmDraw = true; }
  } else {
    rmDraw = false;
  }
  if (rmDraw) {
    clearTimeout(R.drawT);
    R.drawT = setTimeout(function () { run_function("room_render", [], "room"); }, 50);
  }
}
