// The basher's own view of the room and of you, from GMCP (it reads nothing
// of room's): balance, equilibrium and health from Char.Vitals; mobs and
// items here from Char.Items; players here from Room.Players.
if (!client.loom || !client.loom.basher) run_function("basher_setup", [], "basher");
var B = client.loom.basher;
var bsM = args.gmcp_method;
var bsA = args.gmcp_args;
// Some messages arrive as text: read them as room's Here tab does (a bare
// name, as RemovePlayer may send, stays text).
if (typeof bsA === "string") { try { bsA = JSON.parse(bsA); } catch (e) { /* a bare value */ } }

if (bsM === "Char.Vitals" && bsA) {
  B.bal = String(bsA.bal) == "1";
  B.eq = String(bsA.eq) == "1";
  B.hp = to_number(bsA.hp);
  B.maxhp = to_number(bsA.maxhp);
  // The attack went out: balance or equilibrium is gone. The next recovery
  // may attack again.
  if (!B.bal || !B.eq) { B.sentAt = 0; B.misses = 0; }
} else if (/^Char\.Items\.(List|Add|Remove|Update)$/.test(bsM) && bsA && bsA.location === "room") {
  var bsIt = function (it) { return { name: String(it.name || ""), attrib: String(it.attrib || "") }; };
  if (bsM === "Char.Items.List") {
    // A room's list replaces the last one; Room.Info doesn't clear it, as
    // the list can come before or after it (Here works the same way).
    B.room = {};
    B.order = [];
    B.roomKnown = true;
    B.shields = {};
    B.affs = {};
    var bsL = bsA.items || [];
    for (var bsI = 0; bsI < bsL.length; bsI++) { B.room[String(bsL[bsI].id)] = bsIt(bsL[bsI]); B.order.push(String(bsL[bsI].id)); }
  } else if (bsM === "Char.Items.Remove" && bsA.item !== undefined) {
    var bsRid = String(typeof bsA.item === "object" ? bsA.item.id : bsA.item);
    var bsGone = B.room[bsRid];
    delete B.room[bsRid];
    var bsAt = B.order.indexOf(bsRid);
    if (bsAt >= 0) B.order.splice(bsAt, 1);
    // The last living mob of a name left or died: forget its shield and
    // afflictions.
    var bsGn = bsGone ? String(bsGone.name).toLowerCase() : "";
    if (bsGn && (B.shields[bsGn] || B.affs[bsGn])) {
      var bsLeft = false;
      for (var bsK in B.room) { if (B.room.hasOwnProperty(bsK) && String(B.room[bsK].name).toLowerCase() === bsGn && !/d/.test(B.room[bsK].attrib || "")) bsLeft = true; }
      if (!bsLeft) { delete B.shields[bsGn]; delete B.affs[bsGn]; }
    }
  } else if (bsA.item) {
    var bsId = String(bsA.item.id);
    if (!B.room[bsId]) B.order.push(bsId);
    B.room[bsId] = bsIt(bsA.item);
  }
} else if (bsM === "IRE.Target.Set") {
  // The game's target as typed or an id, maybe quoted; empty means none.
  var bsTs = String(bsA === null || bsA === undefined ? "" : (typeof bsA === "object" ? (bsA.target || bsA.id || "") : bsA)).replace(/^"|"$/g, "").trim();
  B.game = { id: bsTs, name: "", at: Date.now() };
} else if (bsM === "IRE.Target.Info" && bsA && bsA.id !== undefined) {
  // Later updates for the same target carry only its health: keep its time.
  var bsTi = String(bsA.id || "");
  if (!(B.game && B.game.id === bsTi)) B.game = { id: bsTi, name: String(bsA.short_desc || ""), at: Date.now() };
} else if (bsM === "Room.Players" && bsA) {
  B.players = {};
  for (var bsP = 0; bsP < bsA.length; bsP++) B.players[String(bsA[bsP].name || "").toLowerCase()] = true;
} else if (bsM === "Room.AddPlayer" && bsA && bsA.name) {
  B.players[String(bsA.name).toLowerCase()] = true;
} else if (bsM === "Room.RemovePlayer" && bsA !== undefined) {
  delete B.players[String(typeof bsA === "object" ? bsA.name : bsA).toLowerCase()];
}
