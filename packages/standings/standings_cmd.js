// STANDINGS <words>. The alias stores the raw text in client.loom.standings.args, since
// run_function cannot pass parameters. "@tag" addresses an organisation.
run_function("standings_ensure", [], "standings");
var F = client.loom.standings.F;
var DB = client.loom.standings.db;
var raw = String(client.loom.standings.args || "").replace(/^\s+|\s+$/g, "");
var W = raw.length ? raw.split(/\s+/) : [];
var now = Math.floor(new Date().getTime() / 1000);

function say(t, c) { display_notice("[standings] " + t, c || "cyan"); }
function render() { run_function("standings_render", [], "standings"); }
function restOf(from) { return W.slice(from).join(" "); }
// Get or create the entity for a name; organisations are keyed with "@".
function ent(word, create) {
  var isOrg = word.charAt(0) === "@";
  var k = isOrg ? "@" + word.slice(1).toLowerCase() : F.key(word);
  if (!DB.e[k] && create) { DB.e[k] = { name: isOrg ? k : F.proper(word), org: isOrg, tags: [], log: [], s: 0 }; }
  return DB.e[k] || null;
}
function kOf(e) { return e.org ? e.name : F.key(e.name); }
function record(e, step, note) {
  var ic = F.ic(now);
  e.log.push([now, ic, step, note || ""]);
  var before = e.s;
  e.s = F.score(e.log);
  F.save();
  var b = F.band(e.s);
  if (step === 0) { say("noted for " + e.name + (ic ? " (" + F.icTxt(ic) + ")" : "") + ": " + (note || ""), "lime"); }
  else { say(e.name + " " + F.steps(step) + ": " + F.signed(before) + " → " + F.signed(e.s) + " (" + b[1] + ")" + (note ? " — " + note : ""), b[2]); }
  client.loom.standings.view = { k: kOf(e) };
  render();
}

if (W.length === 0 || W[0].toLowerCase() === "home") {
  client.loom.standings.view = null;
  render();
  say("overview shown in the Standings tab.");
}
else if (W[0].toLowerCase() === "help") {
  run_function("standings_help", [], "standings");
}
else if (W[0].toLowerCase() === "list") {
  var nl = Math.max(1, Math.min(100, parseInt(W[1], 10) || 15));
  var all = [];
  for (var k in DB.e) { if (DB.e.hasOwnProperty(k) && !DB.e[k].org) { all.push(DB.e[k]); } }
  var i, j, tmp;
  for (i = 1; i < all.length; i++) { tmp = all[i]; j = i - 1; while (j >= 0 && all[j].s < tmp.s) { all[j + 1] = all[j]; j--; } all[j + 1] = tmp; }
  say(all.length + " adventurer(s) on the books, highest first:");
  for (i = 0; i < all.length && i < nl; i++) { var bb = F.band(all[i].s); display_notice("  " + F.signed(all[i].s) + "  " + all[i].name + "  (" + bb[1] + ", " + F.dealings(all[i]) + (F.dealings(all[i]) === 1 ? " dealing)" : " dealings)"), bb[2]); }
}
else if (W[0].toLowerCase() === "tags") {
  var seen = {};
  for (var k2 in DB.e) {
    if (DB.e.hasOwnProperty(k2) && !DB.e[k2].org) {
      var tg = DB.e[k2].tags || [];
      for (var t2 = 0; t2 < tg.length; t2++) { seen[tg[t2]] = 1; }
    }
  }
  var names = [];
  for (var s2 in seen) { if (seen.hasOwnProperty(s2)) { names.push(s2); } }
  names.sort();
  if (names.length === 0) { say("no tags yet. STANDINGS <name> TAG city:eleusis"); }
  for (var t3 = 0; t3 < names.length; t3++) {
    var av = F.tagAvg(names[t3]);
    display_notice("  " + names[t3] + ": " + F.signed(av.avg) + " (" + F.band(av.avg)[1] + ") over " + av.n + " people, " + av.w + " dealings", F.band(av.avg)[2]);
  }
}
else if (W[0].toLowerCase() === "review" || W[0].toLowerCase() === "pending") {
  var P = DB.pending;
  if (P.length === 0) { say("nothing waiting for review."); }
  for (var p = 0; p < P.length; p++) { say((p === 0 ? "next: " : "then: ") + P[p].who + " — " + P[p].why + " (suggested " + F.steps(P[p].step) + (P[p].src ? ", from " + P[p].src : "") + ")"); }
  if (P.length > 0) { say("STANDINGS OK to record the first as suggested, STANDINGS OK ++ to choose the size, STANDINGS SKIP to dismiss it."); }
}
else if (W[0].toLowerCase() === "ok") {
  var P1 = DB.pending;
  if (P1.length === 0) { say("nothing waiting for review."); }
  else {
    var sg = P1.shift();
    var stepO = sg.step;
    var noteO = sg.why;
    if (W[1] && /^[+-]{1,3}$/.test(W[1])) { stepO = W[1].length * (W[1].charAt(0) === "+" ? 1 : -1); if (W.length > 2) { noteO = restOf(2); } }
    else if (W.length > 1) { noteO = restOf(1); }
    record(ent(sg.who, true), stepO, noteO);
  }
}
else if (W[0].toLowerCase() === "skip") {
  if (DB.pending.length === 0) { say("nothing waiting for review."); }
  else { var sk = DB.pending.shift(); F.save(); say("dismissed: " + sk.who + " — " + sk.why + "." + (DB.pending.length ? " " + DB.pending.length + " more waiting." : ""), "lime"); render(); }
}
else if (W[0].toLowerCase() === "rebuild") {
  client.loom.standings.F = undefined;
  run_function("standings_ensure", [], "standings");
  F = client.loom.standings.F;
  // Recompute every standing with the fresh rules.
  for (var kr in DB.e) { if (DB.e.hasOwnProperty(kr)) { DB.e[kr].s = F.score(DB.e[kr].log || []); } }
  F.save();
  say("helpers rebuilt and every standing recomputed.", "lime");
  render();
}
else if (W[0].toLowerCase() === "debug") {
  var cnt = 0, orgs = 0;
  for (var k3 in DB.e) { if (DB.e.hasOwnProperty(k3)) { if (DB.e[k3].org) { orgs++; } else { cnt++; } } }
  say(cnt + " people, " + orgs + " organisations, " + DB.pending.length + " pending; standings_db is " + JSON.stringify(DB).length + " chars.");
  say("IC day now: " + F.ic(now) + " (" + (F.icTxt(F.ic(now)) || "unknown") + "); Ledger " + ((client.loom.ledger || client.lg) ? "loaded" : "not loaded") + "; social lists " + ((client.loom.social && client.loom.social.look) ? "found" : "not found") + ".");
}
else {
  var who = W[0];
  var verb = (W[1] || "").toLowerCase();
  if (/^[+-]{1,3}$/.test(W[1] || "")) {
    record(ent(who, true), W[1].length * (W[1].charAt(0) === "+" ? 1 : -1), restOf(2));
  }
  else if (verb === "set") {
    // Catching up: place the standing at a value outright. It is logged like
    // any other entry, so UNDO takes it back and the record shows it.
    var sv = parseFloat(W[2]);
    if (isNaN(sv) || sv < -10 || sv > 10) { say("usage: STANDINGS <name> SET <-10 to 10> [note], e.g. STANDINGS Oceana SET 5 known her for years", "orange"); }
    else {
      var es = ent(who, true);
      var before = es.s;
      var ics = F.ic(now);
      es.log.push([now, ics, 0, restOf(3), Math.round(sv * 100) / 100]);
      es.s = F.score(es.log);
      F.save();
      var bs = F.band(es.s);
      say(es.name + " set: " + F.signed(before) + " → " + F.signed(es.s) + " (" + bs[1] + ")" + (restOf(3) ? " — " + restOf(3) : ""), bs[2]);
      client.loom.standings.view = { k: kOf(es) };
      render();
    }
  }
  else if (verb === "note") {
    if (W.length < 3) { say("usage: STANDINGS <name> NOTE <text>", "orange"); }
    else { record(ent(who, true), 0, restOf(2)); }
  }
  else if (verb === "undo") {
    var eu = ent(who, false);
    if (!eu || eu.log.length === 0) { say("nothing to undo for " + who + ".", "orange"); }
    else {
      var gone = eu.log.pop();
      eu.s = F.score(eu.log);
      F.save();
      say("removed " + (gone.length > 4 ? "set " + F.signed(gone[4]) : F.steps(gone[2])) + (gone[3] ? " (" + gone[3] + ")" : "") + " from " + eu.name + "; now " + F.signed(eu.s) + ".", "lime");
      client.loom.standings.view = { k: kOf(eu) };
      render();
    }
  }
  else if (verb === "tag" || verb === "untag") {
    if (W.length < 3) { say("usage: STANDINGS <name> " + verb.toUpperCase() + " <tag> [more tags]", "orange"); }
    else {
      var et = ent(who, verb === "tag");
      if (!et) { say(who + " is not on the books.", "orange"); }
      else {
        if (!et.tags) { et.tags = []; }
        for (var a = 2; a < W.length; a++) {
          var tag = W[a].toLowerCase();
          var at = -1;
          for (var b = 0; b < et.tags.length; b++) { if (et.tags[b] === tag) { at = b; } }
          if (verb === "tag" && at < 0) { et.tags.push(tag); }
          if (verb === "untag" && at >= 0) { et.tags.splice(at, 1); }
        }
        F.save();
        say(et.name + " tags: " + (et.tags.length ? et.tags.join(", ") : "none") + ".", "lime");
        client.loom.standings.view = { k: kOf(et) };
        render();
      }
    }
  }
  else if (verb === "forget") {
    var ef = ent(who, false);
    if (!ef) { say(who + " is not on the books.", "orange"); }
    else if ((W[2] || "").toLowerCase() !== "confirm") { say("this erases " + ef.name + "'s whole history. STANDINGS " + who.toUpperCase() + " FORGET CONFIRM to proceed.", "orange"); }
    else { delete DB.e[kOf(ef)]; F.save(); client.loom.standings.view = null; say(ef.name + " has been struck from the books.", "orange"); render(); }
  }
  else if (verb === "") {
    var ev = ent(who, false);
    if (!ev && who.charAt(0) !== "@") { say(who + " is not on the books yet; they stand at Neutral. A first nudge or note will add them."); }
    else {
      var kv = ev ? kOf(ev) : "@" + who.slice(1).toLowerCase();
      client.loom.standings.view = { k: kv };
      render();
      if (ev && !ev.org) { var bv = F.band(ev.s); say(ev.name + ": " + F.signed(ev.s) + " (" + bv[1] + "), " + F.dealings(ev) + (F.dealings(ev) === 1 ? " dealing" : " dealings") + ". Details in the Standings tab.", bv[2]); }
      else { var tv = F.tagAvg(kv.slice(1)); say(kv + ": members average " + F.signed(tv.avg) + " over " + tv.n + " people" + (ev ? ", direct standing " + F.signed(ev.s) : "") + ". Details in the Standings tab."); }
    }
  }
  else { say("did not understand '" + W[1] + "'. STANDINGS HELP lists the forms.", "orange"); }
}