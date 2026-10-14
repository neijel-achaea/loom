// Gold changing hands, for the party split (#89):
//   "Xylarys picks up 50 gold sovereigns."         -> pick
//   "You drop 50 gold sovereigns." / "X drops ..." -> drop
//   "Grulk gives 20 gold sovereigns to you."       -> give (also "You give N
//   ... to X"; between two others the game says "some", with no amount)
// Only the hunt's own people count (you and the party).
if (!client.loom || !client.loom.huntstats || !client.loom.huntstats.xpTable) run_function("huntstats_setup", [], "huntstats");
var HS = client.loom.huntstats;
var gpLine = String(args[0]);
var gpM;
function gpWho(w) { return w === "You" || w === "you" ? "you" : w; }
function gpAmt(a) { return parseInt(String(a).replace(/,/g, ""), 10); }
if ((gpM = gpLine.match(/^([A-Z][a-z]+) picks up ([\d,]+) gold sovereigns?\.$/))) {
  HS.held(gpWho(gpM[1]), gpAmt(gpM[2]));
} else if ((gpM = gpLine.match(/^(You|[A-Z][a-z]+) drops? ([\d,]+) gold sovereigns?\.$/))) {
  HS.held(gpWho(gpM[1]), -gpAmt(gpM[2]));
} else if ((gpM = gpLine.match(/^(You|[A-Z][a-z]+) gives? ([\d,]+|some) gold sovereigns? to (you|[A-Z][a-z]+)\.$/))) {
  var gpFrom = gpWho(gpM[1]), gpTo = gpWho(gpM[3]);
  if (gpM[2] === "some") {
    if (HS.cur && HS.cur.area !== undefined && HS.inHunt(gpFrom) && HS.inHunt(gpTo)) {
      if (!HS.cur.unknown) HS.cur.unknown = [];
      HS.cur.unknown.push(gpFrom + " to " + gpTo);
      HS.save();
    }
  } else {
    HS.held(gpFrom, -gpAmt(gpM[2]));
    HS.held(gpTo, gpAmt(gpM[2]));
  }
}
