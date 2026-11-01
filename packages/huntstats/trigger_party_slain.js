// "<mob> has been slain by <Name>." -- a kill by someone else in the room.
// Counted as a party kill when <Name> is in this hunt's party (hand-made or
// following), kept apart from your own kills.
var HS = client.loom && client.loom.huntstats;
if (HS && HS.cur && HS.cur.area !== undefined) {
  var hsWho = String(args[2] || "").toLowerCase(), hsIn = false;
  for (var hsK in (HS.cur.players || {})) { if (HS.cur.players.hasOwnProperty(hsK) && hsK.toLowerCase() === hsWho) { hsIn = true; break; } }
  if (hsIn) {
    HS.cur.pkills = (HS.cur.pkills || 0) + 1;
    HS.save(false);
    if (HS.cur.firstXpAt) run_function("huntstats_render", [], "huntstats");
  }
}
