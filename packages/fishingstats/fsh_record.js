// Records a landed fish. Callers set:
//   client.fshIn = { angler: "Oceana", species: "blue eel", oz: 41 }
// Trigger wording can change without touching the tally or the display.
run_function("fsh_ensure", [], "fishingstats");
run_function("fsh_touch", [], "fishingstats");
var inp = client.fshIn;
client.fshIn = null;
if (inp && inp.angler && inp.species) {
  var s = client.fsh;
  var now = Math.floor(new Date().getTime() / 1000);
  var who = String(inp.angler);
  var sp = String(inp.species).toLowerCase();
  var oz = parseInt(inp.oz, 10);
  if (isNaN(oz) || oz < 0) { oz = 0; }

  if (!s.anglers[who]) { s.anglers[who] = { n: 0, oz: 0, best: 0, bestSp: "", casts: 0, hooks: 0, sp: {} }; }
  var a = s.anglers[who];
  a.n += 1;
  a.oz += oz;
  if (oz > a.best) { a.best = oz; a.bestSp = sp; }
  a.sp[sp] = (a.sp[sp] || 0) + 1;

  if (!s.species[sp]) { s.species[sp] = { n: 0, oz: 0, best: 0, bestBy: "" }; }
  var f = s.species[sp];
  f.n += 1;
  f.oz += oz;
  if (oz > f.best) { f.best = oz; f.bestBy = who; }

  s.n += 1;
  s.recent.push([now, who, sp, oz]);
  while (s.recent.length > client.fshRecentCap) { s.recent.shift(); }

  // Compare against the yearly rankings if they have been read. Ranking rows
  // truncate long species names, so a stored key that prefixes the caught
  // name counts as the same fish.
  var rec = client.fshRec.f;
  var hit = null;
  var key;
  if (rec[sp]) { hit = rec[sp]; }
  else {
    for (key in rec) {
      if (rec.hasOwnProperty(key) && key.length > 3 && sp.indexOf(key) === 0) { hit = rec[key]; break; }
    }
  }
  if (hit && oz > hit[0]) {
    s.rec = (s.rec || 0) + 1;
    var lb1 = Math.floor(oz / 16);
    display_notice("[fishing] " + who + "'s " + sp + " at " + lb1 + "lb " + (oz % 16) + "oz beats this year's ranking of " + Math.floor(hit[0] / 16) + "lb " + (hit[0] % 16) + "oz by " + hit[1] + ".", "cyan");
  }

  try { set_variable("fsh_session", JSON.stringify(s)); } catch (e) {}
  run_function("fsh_render", [], "fishingstats");
}