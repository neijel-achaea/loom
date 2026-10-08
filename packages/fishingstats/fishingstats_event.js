// Counts casts and hooks so a landing rate can be shown.
//   FS.evt = { angler: "Arlen", type: "cast" }   type: cast | hook
if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
run_function("fishingstats_touch", [], "fishingstats");
var ev = FS.evt;
FS.evt = null;
if (ev && ev.angler && ev.type) {
  var s = FS.session;
  var who = String(ev.angler);
  if (!s.anglers[who]) { s.anglers[who] = { n: 0, oz: 0, best: 0, bestSp: "", casts: 0, hooks: 0, sp: {} }; }
  var a = s.anglers[who];
  if (!a.casts) { a.casts = 0; }
  if (!a.hooks) { a.hooks = 0; }
  if (ev.type === "cast") { a.casts += 1; }
  else { a.hooks += 1; }
  try { set_variable("fishingstats_session", JSON.stringify(s)); } catch (e) {}
  run_function("fishingstats_render", [], "fishingstats");
}