// SELF [WANT|UNWANT <defences...>] | SELF WANTS. The alias stores the words in
// client.selfArgs, since run_function cannot pass parameters.
run_function("self_init", [], "self");
var W = String(client.selfArgs || "").replace(/^\s+|\s+$/g, "").toLowerCase();
var parts = W.length ? W.split(/\s+/) : [];
var verb = parts[0] || "";
function say(t, c) { display_notice("[self] " + t, c || "#e0a0a8"); }
function saveWant() {
  var a = [];
  for (var k in client.selfWant) { if (client.selfWant.hasOwnProperty(k)) { a.push(k); } }
  a.sort();
  try { set_variable("self_want_" + client.selfWantCls, a.join(",")); } catch (e) {}
  return a;
}
if (verb === "want" || verb === "unwant") {
  if (parts.length < 2) { say("usage: SELF " + verb.toUpperCase() + " <defence> [more defences]", "orange"); }
  else {
    for (var i = 1; i < parts.length; i++) { if (verb === "want") { client.selfWant[parts[i]] = true; } else { delete client.selfWant[parts[i]]; } }
    var list = saveWant();
    say("watching as " + client.selfWantCls.replace(/_/g, " ") + ": " + (list.length ? list.join(", ") : "nothing") + ".");
    run_function("self_render", [], "self");
  }
}
else if (verb === "keep" || verb === "unkeep") {
  if (parts.length < 2) { say("usage: SELF " + verb.toUpperCase() + " <affliction> [more]", "orange"); }
  else {
    for (var j = 1; j < parts.length; j++) { if (verb === "keep") { client.selfKeep[parts[j]] = true; } else { delete client.selfKeep[parts[j]]; } }
    var kl = [];
    for (var kk in client.selfKeep) { if (client.selfKeep.hasOwnProperty(kk)) { kl.push(kk); } }
    kl.sort();
    try { set_variable("self_keep", kl.join(",")); } catch (e) {}
    say("kept on purpose: " + (kl.length ? kl.join(", ") : "nothing") + ".");
    run_function("self_render", [], "self");
  }
}
else if (verb === "wants") { var l2 = saveWant(); say("watching as " + client.selfWantCls.replace(/_/g, " ") + ": " + (l2.length ? l2.join(", ") : "nothing") + "."); }
else {
  say("the Self tab follows your afflictions and defences live. DIAG and DEF refresh the full lists.");
  say("SELF WANT <defence...> watches defences for your current class (each class, dragonform included, keeps its own list; missing ones show in red, and losing one is announced). SELF UNWANT <defence...>, SELF WANTS.");
  say("SELF KEEP <affliction...> hides afflictions you keep on purpose. SELF UNKEEP <affliction...>.");
}