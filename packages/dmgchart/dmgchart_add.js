if (!client.loom || !client.loom.dmgchart || !client.loom.dmgchart.saved) run_function("dmgchart_setup", [], "dmgchart");
// Adds client.loom.dmgchart.ev ({dir, type, amt}) to the current fight and, if one is open, the session.
var d = client.loom.dmgchart;
var e = d.ev;
if (e && !isNaN(e.amt)) {
  var now = Date.now();
  var gapMs = d.gap * 1000;
  var f = d.fight;
  if (!f || now - f.last > gapMs) {
    f = { start: now, last: now, inc: {}, out: {}, incTotal: 0, outTotal: 0, heal: 0 };
    d.fight = f;
    d.lastInc = null;
  }
  f[e.dir][e.type] = (f[e.dir][e.type] || 0) + e.amt;
  f[e.dir + "Total"] += e.amt;
  // Hit counts and the biggest single hit, per direction, for the exchange stats.
  if (!f.hits) { f.hits = { inc: { n: 0, max: 0 }, out: { n: 0, max: 0 } }; }
  f.hits[e.dir].n++;
  if (e.amt > f.hits[e.dir].max) { f.hits[e.dir].max = e.amt; }
  f.last = now;
  var ss = d.sess;
  if (ss) {
    if (ss.lastT && now - ss.lastT <= gapMs) { ss.combatMs += now - ss.lastT; } else { ss.fights++; }
    ss.lastT = now;
    ss[e.dir][e.type] = (ss[e.dir][e.type] || 0) + e.amt;
    ss[e.dir + "Total"] += e.amt;
    if (!ss.hits) { ss.hits = { inc: { n: 0, max: 0 }, out: { n: 0, max: 0 } }; }
    ss.hits[e.dir].n++;
    if (e.amt > ss.hits[e.dir].max) { ss.hits[e.dir].max = e.amt; }
    if (now - d.sessSaved > 5000) { set_variable("dmgchart_open", JSON.stringify(ss)); d.sessSaved = now; }
  }
  if (e.dir == "inc") d.incSince = (d.incSince || 0) + e.amt;
  if (e.dir == "inc") { d.lastInc = { type: e.type, amt: e.amt, t: now, inSess: !!ss }; }
  run_function("dmgchart_render", [], "dmgchart");
}
d.ev = null;
