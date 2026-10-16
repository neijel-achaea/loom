// The basher's own view of the room and of you, from GMCP (it reads nothing
// of room's): balance, equilibrium and health from Char.Vitals; mobs and
// items here from Char.Items; players here from Room.Players.
if (!client.loom || !client.loom.basher) run_function("basher_setup", [], "basher");
var B = client.loom.basher;
var bsM = args.gmcp_method;
var bsA = args.gmcp_args;

if (bsM === "Char.Vitals" && bsA) {
  B.bal = String(bsA.bal) == "1";
  B.eq = String(bsA.eq) == "1";
  B.hp = to_number(bsA.hp);
  B.maxhp = to_number(bsA.maxhp);
  // The attack went out: balance or equilibrium is gone. The next recovery
  // may attack again.
  if (!B.bal || !B.eq) { B.sentAt = 0; B.misses = 0; }
} else if (bsM === "Room.Info") {
  // A new room: what was here is gone until its Char.Items.List.
  B.room = {};
} else if (/^Char\.Items\.(List|Add|Remove|Update)$/.test(bsM) && bsA && bsA.location === "room") {
  var bsIt = function (it) { return { name: String(it.name || ""), attrib: String(it.attrib || "") }; };
  if (bsM === "Char.Items.List") {
    B.room = {};
    var bsL = bsA.items || [];
    for (var bsI = 0; bsI < bsL.length; bsI++) B.room[String(bsL[bsI].id)] = bsIt(bsL[bsI]);
  } else if (bsM === "Char.Items.Remove") {
    delete B.room[String(typeof bsA.item === "object" ? bsA.item.id : bsA.item)];
  } else if (bsA.item) {
    B.room[String(bsA.item.id)] = bsIt(bsA.item);
  }
} else if (bsM === "Room.Players" && bsA) {
  B.players = {};
  for (var bsP = 0; bsP < bsA.length; bsP++) B.players[String(bsA[bsP].name || "").toLowerCase()] = true;
} else if (bsM === "Room.AddPlayer" && bsA && bsA.name) {
  B.players[String(bsA.name).toLowerCase()] = true;
} else if (bsM === "Room.RemovePlayer" && bsA !== undefined) {
  delete B.players[String(typeof bsA === "object" ? bsA.name : bsA).toLowerCase()];
}
