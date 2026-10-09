if (!client.loom || !client.loom.dmgchart || !client.loom.dmgchart.saved) run_function("dmgchart_setup", [], "dmgchart");
// Bleeding arrives as "Health lost: N (raw)." then "You bleed N health."
// If that raw line was just recorded, move it from raw to bleed (fight and session); else record bleed.
var amt = parseInt(args[1], 10);
var d = client.loom.dmgchart;
var li = d.lastInc;
var f = d.fight;
if (f && li && li.type == "raw" && li.amt == amt && Date.now() - li.t < 1500 && (f.inc.raw || 0) >= amt) {
  f.inc.raw -= amt;
  if (f.inc.raw <= 0) { delete f.inc.raw; }
  f.inc.bleed = (f.inc.bleed || 0) + amt;
  if (li.inSess && d.sess && (d.sess.inc.raw || 0) >= amt) {
    d.sess.inc.raw -= amt;
    if (d.sess.inc.raw <= 0) { delete d.sess.inc.raw; }
    d.sess.inc.bleed = (d.sess.inc.bleed || 0) + amt;
  }
  d.lastInc = { type: "bleed", amt: amt, t: li.t, inSess: li.inSess };
  run_function("dmgchart_render", [], "dmgchart");
} else {
  d.ev = { dir: "inc", type: "bleed", amt: amt };
  run_function("dmgchart_add", [], "dmgchart");
}
