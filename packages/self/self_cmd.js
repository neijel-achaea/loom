// self_cmd -- SELF and its subcommands; the words arrive in
// client.loom.self.args (see the alias).
if (!client.loom || !client.loom.self || !client.loom.self.keep) run_function("self_setup", [], "self");
var S = client.loom.self;
var raw = String(S.args || "").replace(/^\s+|\s+$/g, "");
var parts = raw.length ? raw.split(/\s+/) : [];
var verb = (parts[0] || "").toLowerCase();
function say(t, c) { display_notice("[self] " + t, c || "cyan"); }
function keysOf(o) { var a = []; for (var k in o) { if (o.hasOwnProperty(k)) a.push(k); } a.sort(); return a; }
function clsName() { return String(S.wantCls || "any").replace(/_/g, " "); }
function saveWant() {
  var a = keysOf(S.want);
  try { set_variable("self_want_" + S.wantCls, a.join(",")); } catch (e) {}
  return a;
}
function saveKeep() {
  var a = keysOf(S.keep);
  try { set_variable("self_keep", a.join(",")); } catch (e) {}
  return a;
}

if (verb === "" || verb === "status") {
  var I = S.info || {};
  var who = S.nameOverride || I.name || "(name not seen yet)";
  var bits = [];
  if (I.race) bits.push(I.race);
  if (I["class"] && String(I["class"]).toLowerCase() !== String(I.race || "").toLowerCase()) bits.push(I["class"]);
  if (I.level) bits.push("level " + String(I.level).split(" ")[0]);
  say(who + (bits.length ? " - " + bits.join(", ") : "") + ".");
  var aff = [];
  for (var an in S.affs) { if (S.affs.hasOwnProperty(an) && !S.keep[an.replace(/\s*\(\d+\)$/, "")]) aff.push(an); }
  aff.sort();
  say(S.seenAffs ? (aff.length ? aff.length + " affliction" + (aff.length === 1 ? "" : "s") + ": " + aff.join(", ") + "." : "no afflictions.") : "afflictions not reported yet; DIAG fills them in.", aff.length ? "orange" : undefined);
  if (S.needDiag) say("a venom's effects are unknown: DIAG!", "orange");
  var wl = keysOf(S.want);
  var miss = [];
  for (var wi = 0; wi < wl.length; wi++) { if (!S.defs[wl[wi]]) miss.push(wl[wi]); }
  if (!S.seenDefs) say("defences not reported yet; DEF fills them in.");
  else say(keysOf(S.defs).length + " defences up; watching " + wl.length + " as " + clsName() + (miss.length ? ", missing: " + miss.join(", ") + "." : (wl.length ? ", all up." : ".")), miss.length ? "orange" : undefined);
  say("SELF HELP for commands.");
} else if (verb === "help") {
  run_function("self_help", [], "self");
} else if (verb === "want" || verb === "unwant") {
  if (parts.length < 2) { say("usage: SELF " + verb.toUpperCase() + " <defence> [more defences]", "orange"); }
  else {
    for (var i = 1; i < parts.length; i++) { var dn = parts[i].toLowerCase(); if (verb === "want") S.want[dn] = true; else delete S.want[dn]; }
    var list = saveWant();
    say("watching as " + clsName() + ": " + (list.length ? list.join(", ") : "nothing") + ".", "lime");
    run_function("self_render", [], "self");
  }
} else if (verb === "wants") {
  var l2 = keysOf(S.want);
  say("watching as " + clsName() + ": " + (l2.length ? l2.join(", ") : "nothing") + ".", "lime");
} else if (verb === "keep" || verb === "unkeep") {
  if (parts.length < 2) { say("usage: SELF " + verb.toUpperCase() + " <affliction> [more]", "orange"); }
  else {
    for (var j = 1; j < parts.length; j++) { var kn = parts[j].toLowerCase(); if (verb === "keep") S.keep[kn] = true; else delete S.keep[kn]; }
    var kl = saveKeep();
    say("kept on purpose: " + (kl.length ? kl.join(", ") : "nothing") + ".", "lime");
    run_function("self_render", [], "self");
  }
} else if (verb === "keeps") {
  var k2 = keysOf(S.keep);
  say("kept on purpose: " + (k2.length ? k2.join(", ") : "nothing") + ".", "lime");
} else if (verb === "name") {
  var nv = parts[1] || "";
  if (!nv) {
    say(S.nameOverride ? "the tab says " + S.nameOverride + " (set with SELF NAME). SELF NAME CLEAR uses the game's name" + (S.info.name ? ", " + S.info.name : "") + "." : "the tab uses the game's name" + (S.info.name ? ", " + S.info.name : "") + ". SELF NAME <name> to show another.");
  } else if (nv.toLowerCase() === "clear" || nv.toLowerCase() === "off") {
    S.nameOverride = "";
    try { delete_variable("self_name"); } catch (e) {}
    say("the tab uses the game's name" + (S.info.name ? ", " + S.info.name : "") + ".", "lime");
    run_function("self_render", [], "self");
  } else if (S.info.name && nv.toLowerCase() === String(S.info.name).toLowerCase()) {
    S.nameOverride = "";
    try { delete_variable("self_name"); } catch (e) {}
    say("that's the game's name already, so the tab just follows it.");
    run_function("self_render", [], "self");
  } else {
    // Capitalised as the game writes names.
    S.nameOverride = nv.charAt(0).toUpperCase() + nv.slice(1).toLowerCase();
    set_variable("self_name", S.nameOverride);
    say("the tab now says " + S.nameOverride + ".", "lime");
    run_function("self_render", [], "self");
  }
} else if (verb === "debug") {
  say("info=" + JSON.stringify(S.info) + " wantCls=" + S.wantCls + " want=" + keysOf(S.want).join(",") + " keep=" + keysOf(S.keep).join(","), "cyan");
  say("affs=" + keysOf(S.affs).join(",") + " defs=" + keysOf(S.defs).length + " lost=" + keysOf(S.lost).join(",") + " seen " + S.seenAffs + "/" + S.seenDefs + " needDiag=" + S.needDiag + " score=" + JSON.stringify(S.score), "cyan");
} else {
  say("unknown command '" + verb + "'. SELF HELP for commands.", "orange");
}
