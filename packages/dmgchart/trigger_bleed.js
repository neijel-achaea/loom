if (!client.loom || !client.loom.dmgchart || !client.loom.dmgchart.saved) run_function("dmgchart_setup", [], "dmgchart");
// Bleeding arrives as "Health lost: N (raw)." then "You bleed N health."
// If that raw line was just recorded, take it back (amount, hit, fight time,
// and the fight it opened, if any), then record the amount as passive bleeding,
// which counts but doesn't keep a fight going (#152).
var amt = parseInt(args[1], 10);
var d = client.loom.dmgchart;
var li = d.lastInc;
if (li && li.type == "raw" && li.amt == amt && li.undo && Date.now() - li.t < 1500) {
  var u = li.undo;
  var f = d.fight;
  if (f && (f.inc.raw || 0) >= amt) {
    f.inc.raw -= amt;
    if (f.inc.raw <= 0) { delete f.inc.raw; }
    f.incTotal -= amt;
    if (f.hits) { f.hits.inc.n--; f.hits.inc.max = u.max || 0; }
    if (u.opened) { d.fight = u.fight; } else { f.last = u.last; }
  }
  // The rolling record (#59): the raw line came off it too.
  var ur = u.rec;
  if (ur && d.rec && ur.seg && d.rec[d.rec.length - 1] === ur.seg) {
    if (ur.opened) { d.rec.pop(); }
    else { ur.seg.last = ur.last; ur.seg.ms = ur.ms; ur.seg.dmg = ur.dmg; ur.seg.max = ur.max; }
  }
  var ss = d.sess;
  if (li.inSess && ss && (ss.inc.raw || 0) >= amt) {
    ss.inc.raw -= amt;
    if (ss.inc.raw <= 0) { delete ss.inc.raw; }
    ss.incTotal -= amt;
    if (ss.hits) { ss.hits.inc.n--; ss.hits.inc.max = u.sMax || 0; }
    ss.lastT = u.sLastT;
    ss.combatMs = u.sCombat;
    ss.fights = u.sFights;
  }
}
d.ev = { dir: "inc", type: "bleed", amt: amt };
run_function("dmgchart_add", [], "dmgchart");
