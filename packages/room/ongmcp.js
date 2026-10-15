// Everything on the Here tab comes from GMCP: Room.Info for the room, Room.Players
// and Add/RemovePlayer for who's here, Char.Items (location "room") for mobs and
// items. A room change sends several of these in a row, so the tab is drawn
// once, 50ms after the last of them.
var rmM = "";
var rmA = null;
try { rmM = args.gmcp_method; rmA = args.gmcp_args; } catch (e) { rmM = ""; }
if (typeof rmA === "string") { try { rmA = JSON.parse(rmA); } catch (e) { /* a bare name, as RemovePlayer may send */ } }
var rmMine = /^Room\.(Info|Players|AddPlayer|RemovePlayer)$/.test(rmM) || (/^Char\.Items\.(List|Add|Remove|Update)$/.test(rmM) && rmA && rmA.location === "room") || rmM === "Char.Name" || rmM === "Char.Status";
if (rmMine) {
  if (!client.loom || !client.loom.room || !client.loom.room.raw) run_function("room_setup", [], "room");
  var R = client.loom.room;
  if (rmM !== "Char.Status") R.raw[rmM] = rmA;
  var rmDraw = true;
  if (rmM === "Room.Info" && rmA) {
    R.info = rmA;
  } else if (rmM === "Room.Players" && rmA && rmA.length !== undefined) {
    R.players = {};
    for (var rmI = 0; rmI < rmA.length; rmI++) { if (rmA[rmI] && rmA[rmI].name) R.players[rmA[rmI].name] = rmA[rmI].fullname || rmA[rmI].name; }
  } else if (rmM === "Room.AddPlayer" && rmA && rmA.name) {
    R.players[rmA.name] = rmA.fullname || rmA.name;
  } else if (rmM === "Room.RemovePlayer" && rmA) {
    delete R.players[typeof rmA === "string" ? rmA : rmA.name];
  } else if (rmM === "Char.Items.List") {
    R.items = {};
    var rmL = rmA.items || [];
    for (var rmJ = 0; rmJ < rmL.length; rmJ++) R.items[rmL[rmJ].id] = rmL[rmJ];
  } else if ((rmM === "Char.Items.Add" || rmM === "Char.Items.Update") && rmA.item) {
    R.items[rmA.item.id] = rmA.item;
  } else if (rmM === "Char.Items.Remove" && rmA.item !== undefined) {
    delete R.items[typeof rmA.item === "object" ? rmA.item.id : rmA.item];
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
