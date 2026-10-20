if (!client.loom || !client.loom.dmgchart || !client.loom.dmgchart.saved) run_function("dmgchart_setup", [], "dmgchart");
// Adds client.loom.dmgchart.ev ({dir, type, amt}) to the current fight and, if one is open, the session.
// Incoming bleeding is passive: it counts in the totals but is not a hit, does
// not keep a fight going and does not start one (#152). A tick after the gap
// goes to the fight that just ended; with no fight at all, only to the session.
var d = client.loom.dmgchart;
var e = d.ev;
// A crit on a hits.out object: cn crits, cdmg their damage, ct per tier
// {n, dmg}. Saved sessions keep it with the hit counts (#185).
function addCrit(h, c) {
  h.cn = (h.cn || 0) + 1;
  h.cdmg = (h.cdmg || 0) + c.amt;
  if (!h.ct) h.ct = {};
  if (!h.ct[c.tier]) h.ct[c.tier] = { n: 0, dmg: 0 };
  h.ct[c.tier].n++;
  h.ct[c.tier].dmg += c.amt;
}
if (e && !isNaN(e.amt)) {
  var now = Date.now();
  var gapMs = d.gap * 1000;
  var passive = (e.dir == "inc" && e.type == "bleed");
  // A crit line just before this outgoing hit makes it a crit (#185).
  var crit = null;
  if (e.dir == "out" && d.crit && now - d.crit.t < 1500) crit = { tier: d.crit.tier, amt: e.amt };
  if (e.dir == "out") d.crit = null;
  var f = d.fight;
  var ss = d.sess;
  // What this event changes, so trigger_bleed can take back a raw line that
  // turns out to be bleeding (the game prints "Health lost: N (raw)." first).
  var undo = { fight: f, opened: false, last: f ? f.last : 0, sLastT: ss ? ss.lastT : 0, sCombat: ss ? ss.combatMs : 0, sFights: ss ? ss.fights : 0 };
  if (!passive && (!f || now - f.last > gapMs)) {
    f = { start: now, last: now, inc: {}, out: {}, incTotal: 0, outTotal: 0 };
    d.fight = f;
    d.lastInc = null;
    undo.opened = true;
  }
  if (f) {
    f[e.dir][e.type] = (f[e.dir][e.type] || 0) + e.amt;
    f[e.dir + "Total"] += e.amt;
    if (!passive) {
      // Hit counts and the biggest single hit, per direction, for the exchange stats.
      if (!f.hits) { f.hits = { inc: { n: 0, max: 0 }, out: { n: 0, max: 0 } }; }
      undo.max = f.hits[e.dir].max;
      f.hits[e.dir].n++;
      if (e.amt > f.hits[e.dir].max) { f.hits[e.dir].max = e.amt; }
      if (crit) addCrit(f.hits.out, crit);
      f.last = now;
    }
  }
  // The rolling record (#59): fights as segments, combat time as the
  // session counts it, incoming damage and the biggest incoming hit.
  if (!passive && d.rec) {
    var rg = d.rec.length ? d.rec[d.rec.length - 1] : null;
    undo.rec = { opened: false, seg: rg, last: rg ? rg.last : 0, ms: rg ? rg.ms : 0, dmg: rg ? rg.dmg : 0, max: rg ? rg.max : 0 };
    if (!rg || now - rg.last > gapMs) {
      rg = { start: now, last: now, ms: 0, dmg: 0, max: 0 };
      d.rec.push(rg);
      undo.rec.opened = true;
      undo.rec.seg = rg;
      if (d.rec.length > d.recCap) { d.rec.splice(0, d.rec.length - d.recCap); d.recFrom = d.rec[0].start; }
    } else {
      rg.ms += now - rg.last;
      rg.last = now;
    }
    if (e.dir == "inc") {
      rg.dmg += e.amt;
      if (e.amt > rg.max) rg.max = e.amt;
    }
  }
  if (ss) {
    if (!passive) {
      if (ss.lastT && now - ss.lastT <= gapMs) { ss.combatMs += now - ss.lastT; } else { ss.fights++; }
      ss.lastT = now;
      if (!ss.hits) { ss.hits = { inc: { n: 0, max: 0 }, out: { n: 0, max: 0 } }; }
      undo.sMax = ss.hits[e.dir].max;
      ss.hits[e.dir].n++;
      if (e.amt > ss.hits[e.dir].max) { ss.hits[e.dir].max = e.amt; }
      if (crit) addCrit(ss.hits.out, crit);
    }
    ss[e.dir][e.type] = (ss[e.dir][e.type] || 0) + e.amt;
    ss[e.dir + "Total"] += e.amt;
    if (now - d.sessSaved > 5000) { set_variable("dmgchart_open", JSON.stringify(ss)); d.sessSaved = now; }
  }
  if (e.dir == "inc") {
    d.lastInc = { type: e.type, amt: e.amt, t: now, inSess: !!ss, undo: undo };
    run_function("dmgchart_lasts", [], "dmgchart");
  }
  if (d.drawSoon) d.drawSoon(); else run_function("dmgchart_render", [], "dmgchart");
}
d.ev = null;
