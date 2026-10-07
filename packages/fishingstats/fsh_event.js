// Counts casts and hooks so a landing rate can be shown.
//   client.fshEvt = { angler: "Oceana", type: "cast" }   type: cast | hook
run_function("fsh_ensure", [], "fishingstats");
run_function("fsh_touch", [], "fishingstats");
var ev = client.fshEvt;
client.fshEvt = null;
if (ev && ev.angler && ev.type) {
  var s = client.fsh;
  var who = String(ev.angler);
  if (!s.anglers[who]) { s.anglers[who] = { n: 0, oz: 0, best: 0, bestSp: "", casts: 0, hooks: 0, sp: {} }; }
  var a = s.anglers[who];
  if (!a.casts) { a.casts = 0; }
  if (!a.hooks) { a.hooks = 0; }
  if (ev.type === "cast") { a.casts += 1; }
  else { a.hooks += 1; }
  try { set_variable("fsh_session", JSON.stringify(s)); } catch (e) {}
  run_function("fsh_render", [], "fishingstats");
}