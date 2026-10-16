// basher_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, defaults, and the helpers
// (rebuilt on every run; only data is kept).
//
// The basher is the automation layer over hunting (#115): it reads hunting's
// class data (the main attack in use, HU.mainNow), and never writes to it.
// Without hunting it sends nothing. Attended by design: it only reacts to
// the current room and never walks.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.basher) client.loom.basher = {};
client.loom.registry.basher = { version: "0.2.0", keyword: "BASHER", desc: "{{description}}" };
var B = client.loom.basher;

// Health threshold: attacks hold below it and resume 10 points above it.
if (!get_variable("basher_health")) set_variable("basher_health", "40");

// Runtime state, kept across a reimport. ON is never remembered across a load:
// the basher always starts OFF.
// Ricardo: BASHER ON only primes it (B.on); your own attack starts a run
// (B.run, from basher_attackline), which lasts until the room has no more of
// your target or BASHER STOP. Then it waits primed for your next attack.
if (B.on === undefined) B.on = false;
if (B.run === undefined) B.run = false;
if (!B.room) B.room = {};          // mobs and items here: { id: { name, attrib } }
if (!B.order) B.order = [];        // their ids in the room's own order (targeting by name follows it)
// Whether B.room holds a room's list: once any Char.Items.List came since
// this package was set up. Before that (reimported mid-room) the target
// counts as here, and your kill ends the run.
if (B.roomKnown === undefined) B.roomKnown = false;
// The game's own target (IRE.Target.Set/Info: { id, name, at }) and when the
// tar variable last changed: whichever changed last is the target, as in
// room's Here tab. Ricardo's test: tar went empty while the game still had
// the bear targeted, and the staff hit it.
if (B.game === undefined) B.game = null;
if (B.tarSeen === undefined) { B.tarSeen = String(get_variable("tar") || "").trim(); B.tarAt = 0; }
if (!B.players) B.players = {};    // players here, lowercase name -> true
if (B.bal === undefined) { B.bal = false; B.eq = false; B.hp = 0; B.maxhp = 0; }
B.sentAt = B.sentAt || 0;          // when the last attack went out (0: none pending)
B.misses = B.misses || 0;          // attacks sent without balance or equilibrium going
B.low = !!B.low;                   // holding for health
B.diag = !!B.diag;                 // a DIAGNOSE owed for venom confusion
B.diagAt = B.diagAt || 0;          // when the last one went out
// Mobs whose shield is up, by name as the game writes it ("a mist wraith"),
// lowercase -> true. The lines name the mob, not its id, so a shield on one
// of two same-name mobs holds attacks on both. Cleared by its fade line, a
// new room list, or when no living mob of that name is left.
if (!B.shields) B.shields = {};
// Afflictions seen on mobs, by name like the shields: { "a mist wraith":
// { clumsiness: true } }, from the target's own lines (B.affLines), for the
// rage rotation's "when" conditions. Cleared the same way as shields.
if (!B.affs) B.affs = {};
B.rageSent = B.rageSent || null;   // { name, at }: a rage ability sent, not yet seen used

// Battlerage on by default (#119); BASHER RAGE OFF leaves it to you.
if (!get_variable("basher_rage")) set_variable("basher_rage", "on");

// Afflictions on a mob: [pattern (group 1 = the mob), affliction, on?].
// Add rows as lines are captured; the names are what "when" lists use.
B.affLines = [
  [/^(.+) reels, flinching as clumsiness takes hold\.$/, "clumsiness", true],
  [/^Frost blooms outwards from you, wreathing (.+) in frigid cold as clumsiness takes hold\.$/, "clumsiness", true],
  [/^(.+) rallies, no longer plagued with clumsiness\.$/, "clumsiness", false],
  [/^(.+) shakes off the cold and clumsiness plaguing \w+\.$/, "clumsiness", false]
];
// A line about a mob's affliction: true when it was one.
B.affLine = function (line) {
  for (var i = 0; i < B.affLines.length; i++) {
    var m = B.affLines[i][0].exec(line);
    if (!m) continue;
    var n = String(m[1]).toLowerCase();
    if (B.affLines[i][2]) { if (!B.affs[n]) B.affs[n] = {}; B.affs[n][B.affLines[i][1]] = true; }
    else if (B.affs[n]) delete B.affs[n][B.affLines[i][1]];
    return true;
  }
  return false;
};
B.why = B.why || "";               // why it isn't attacking right now (status)

B.tickMs = 250;    // how often the loop looks
B.retryMs = 2500;  // an attack that took no balance by then is counted as a miss
B.maxMisses = 3;   // that many in a row: the basher switches itself off
B.rageRetryMs = 2500; // a rage ability not seen used by then may be sent again

// Hunting, read only. Undefined when it isn't installed (or not set up yet).
B.hunting = function () {
  var hu = client.loom.hunting;
  return (hu && hu.classes && client.loom.registry.hunting) ? hu : undefined;
};

// The main attack: hunting's in use (HUNTING MAIN), else, for classes whose F1
// is a plain key (dragons: {dragon} @tar), that key when it's a "main" attack
// on the target. { name, cmd } or undefined.
B.main = function () {
  var hu = B.hunting();
  if (!hu) return undefined;
  if (hu.mainNow && hu.mainNow.cmd) return { name: hu.mainNow.name, cmd: hu.mainNow.cmd };
  var e = hu.classes[hu.cls];
  var f1 = e && e.keys && e.keys[0];
  if (f1 && f1[2] == "main" && /@tar\b/.test(f1[1] || "")) {
    var nm = String(f1[0]) == "{DRAGON}" ? "dragon attack" : String(f1[0]);
    return { name: nm, cmd: f1[1] };
  }
  return undefined;
};

// The attack: the main attack, sent bare on recovery (Ricardo:
// send on recovery rather than the server's queue). Its "queue add <flags>"
// prefixes are dropped, placeholders filled as hunting's buttons fill them,
// and @tar replaced by the target. A list, one command per part ("a | b").
B.commands = function (tar) {
  var main = B.main();
  return main ? B.prep(main.cmd, tar) : [];
};

// A key's command made ready to send: "queue add <flags>" dropped,
// placeholders filled as hunting's buttons fill them, @tar replaced; one
// command per "|" part.
B.prep = function (cmd, tar) {
  var staff = (client.loom.artificing && client.loom.artificing.staff) || get_variable("artificing_staff") || "scintilla";
  var dragon = get_variable("hunting_dragon_attack") || "gut";
  var party = get_variable("hunting_party_target") || "";
  var parts = String(cmd || "").split("|");
  var out = [];
  for (var i = 0; i < parts.length; i++) {
    var c = parts[i].trim().replace(/^queue\s+add\s+\S+\s+/i, "");
    c = c.replace(/\{staff\}/g, staff).replace(/\{dragon\}/g, dragon).replace(/\{target\}/g, party).replace(/@tar\b/gi, tar).trim();
    if (c) out.push(c);
  }
  return out;
};

// The battlerage rotation (#119): the class's "bash" list in hunting, else a
// default from its costs and keys (Ricardo: the 36 hit, the 14 hit, the 25
// hit while the 36 stays affordable; ties to the lower F-key; razes never).
// [{ name, cost, cmd, when, keep }], only abilities with a key and a cost.
B.rotation = function () {
  var hu = B.hunting();
  var e = hu && hu.classes[hu.cls];
  if (!e || !e.rage) return [];
  var rz = e.razes || [];
  var keyOf = {}, onKeys = [];
  var keys = e.keys || [];
  for (var k = 0; k < keys.length; k++) {
    var ab = (keys[k][2] && keys[k][2] != "main") ? keys[k][2] : keys[k][0];
    if (e.rage[ab] !== undefined && !keyOf[ab]) { keyOf[ab] = keys[k][1]; onKeys.push(ab); }
  }
  var rows = e.bash;
  if (!rows) {
    var first = function (cost) {
      for (var i = 0; i < onKeys.length; i++) if (e.rage[onKeys[i]] === cost && rz.indexOf(onKeys[i]) < 0) return onKeys[i];
      return "";
    };
    var big = first(36), small = first(14), mid = first(25);
    rows = [];
    if (big) rows.push([big]);
    if (small) rows.push([small]);
    if (mid) rows.push(big ? [mid, { keep: big }] : [mid]);
  }
  var out = [];
  for (var r = 0; r < rows.length; r++) {
    var nm = rows[r][0], opt = rows[r][1] || {};
    if (!keyOf[nm] || rz.indexOf(nm) >= 0) continue;
    out.push({ name: nm, cost: e.rage[nm], cmd: keyOf[nm], when: opt.when || null, keep: opt.keep || "" });
  }
  return out;
};

// The rotation in words, for status: "Firefall (clumsiness) > Squeeze > ...".
B.rotationText = function () {
  var rot = B.rotation();
  var w = [];
  for (var i = 0; i < rot.length; i++) {
    w.push(rot[i].name + (rot[i].when ? " (" + rot[i].when.join("/") + ")" : "") + (rot[i].keep ? " (keep " + rot[i].keep + ")" : ""));
  }
  return w.length ? w.join(" > ") : "none for this class";
};

// The first rotation row that can go now, or null: off its cooldown and the
// global one, affordable (hunting's own reading, as its keys light), its
// "when" met on the target, and its "keep" still affordable after it.
B.rageNext = function () {
  var hu = B.hunting();
  if (!hu || !hu.glob) return null;
  var e = hu.classes[hu.cls] || {};
  var rage = to_number(hu.rage);
  var affs = B.affs[B.targetName()] || {};
  var rot = B.rotation();
  for (var i = 0; i < rot.length; i++) {
    var r = rot[i];
    if (hu.cd[r.name] === false || rage < r.cost) continue;
    if (r.when) {
      var ok = false;
      for (var j = 0; j < r.when.length; j++) if (affs[r.when[j]]) ok = true;
      if (!ok) continue;
    }
    if (r.keep && e.rage && e.rage[r.keep] !== undefined && rage - r.cost < e.rage[r.keep]) continue;
    return r;
  }
  return null;
};

// Fire the next rage ability (#119). Battlerage needs no balance or
// equilibrium (hunting queues it without), so this runs on its own clock.
// One at a time: once sent, nothing more until hunting sees it used (its
// attack line), or rageRetryMs passes without it.
B.rageTick = function () {
  if (get_variable("basher_rage") == "off") return;
  var hu = B.hunting();
  var now = Date.now();
  if (B.rageSent) {
    // Seen used: hunting put it (or the global cooldown) on cooldown from its
    // line. The ability's own cooldown outlasts the global one, so this holds
    // even if the global cooldown cleared between two looks.
    if (!hu.glob || hu.cd[B.rageSent.name] === false || now - B.rageSent.at > B.rageRetryMs) B.rageSent = null;
    else return;
  }
  var r = B.rageNext();
  if (!r) return;
  var cmds = B.prep(r.cmd, B.target().tar);
  for (var i = 0; i < cmds.length; i++) send_command(cmds[i], 1);
  B.rageSent = { name: r.name, at: now };
  if (get_variable("debug") == "on") display_notice("[debug][basher] rage " + r.name + ": " + cmds.join(" | "), "cyan");
};

// The target is the tar variable (Ricardo: you pick it until auto-targeting,
// #123). An id is found by id; a word is the first living mob whose name has
// it as a whole word. Never a player: a word that is a player's name here
// counts as no target, so the basher can't attack a person.
B.target = function () {
  var tv = String(get_variable("tar") || "").trim();
  if (tv !== B.tarSeen) { B.tarSeen = tv; B.tarAt = Date.now(); }
  var g = B.game;
  var useGame = !!(g && (g.id || g.name) && (!tv || (g.at || 0) >= (B.tarAt || 0)));
  var tar = useGame ? String(g.id || g.name) : tv;
  if (!tar) return { tar: "", why: "no target" };
  if (B.players[tar.toLowerCase()]) return { tar: tar, why: tar + " is a player here: not attacking" };
  if (!B.roomKnown) return { tar: tar, why: "" };
  var mob = function (it) { return /m/.test(it.attrib || "") && !/d/.test(it.attrib || ""); };
  if (/^\d+$/.test(tar)) {
    var it = B.room[tar];
    if (it && mob(it)) { if (B.run) B.runName = it.name; return { tar: tar, name: it.name, why: "" }; }
    // That one is dead or gone: during a run, the next living mob with the
    // same name (Ricardo: it goes on until the room runs out of targets).
    if (B.run && B.runName) {
      for (var nx = 0; nx < B.order.length; nx++) {
        var nit = B.room[B.order[nx]];
        if (nit && mob(nit) && nit.name === B.runName) return { tar: B.order[nx], name: B.runName, why: "" };
      }
      return { tar: tar, why: "no more " + B.runName.replace(/^(a|an|the|some)\s+/i, "") + " here" };
    }
    return { tar: tar, why: "target " + tar + " isn't here" };
  }
  var re = new RegExp("\\b" + tar.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b");
  for (var oi = 0; oi < B.order.length; oi++) {
    var oit = B.room[B.order[oi]];
    if (oit && mob(oit) && re.test(String(oit.name).toLowerCase())) return { tar: tar, name: oit.name, why: "" };
  }
  return { tar: tar, why: "no " + tar + " here" };
};

// The target's name, lowercase, for the shield lines: from the room list, else
// the game's target info. "" when unknown.
B.targetName = function (t) {
  t = t || B.target();
  var n = t.name || (B.game && B.game.name && String(B.game.id) === String(t.tar) ? B.game.name : "");
  return String(n || "").toLowerCase();
};

// "A nearly invisible magical shield forms around X." (Ricardo): attacks on
// X hold until "The magical shield surrounding X fades away." Razing comes
// later (#125). A notice only when it's the target of a run.
B.shieldUp = function (name) {
  var n = String(name || "").toLowerCase();
  if (!n || B.shields[n]) return;
  B.shields[n] = true;
  if (B.on && B.run && B.targetName() === n) display_notice("[basher] " + name + " is shielded: holding attacks until it fades.", "orange");
};
B.shieldDown = function (name) {
  var n = String(name || "").toLowerCase();
  if (!B.shields[n]) return;
  delete B.shields[n];
  if (B.on && B.run && B.targetName() === n) display_notice("[basher] " + name + "'s shield is gone: attacking again.", "lime");
};

// What the basher sees here, for status: "3 mobs here", or that it has no
// room list yet.
B.seen = function () {
  if (!B.roomKnown) return "no room list yet (move or LOOK)";
  var n = 0;
  for (var i = 0; i < B.order.length; i++) { var it = B.room[B.order[i]]; if (it && /m/.test(it.attrib || "") && !/d/.test(it.attrib || "")) n++; }
  return n + (n == 1 ? " mob" : " mobs") + " here";
};

// Why it can't attack right now ("" when it can). Health is checked first,
// so the hold and the resume are announced even without balance.
B.blocked = function () {
  return B.held() || ((!B.bal || !B.eq) ? "waiting for balance and equilibrium" : "");
};

// Everything that holds both the attack and battlerage (balance aside).
B.held = function () {
  if (!B.hunting()) return "hunting isn't installed";
  if (get_variable("pauseTriggers") == "on") return "paused (pauseTriggers)";
  var hu = B.hunting();
  if (!B.main()) return "no main attack for " + (hu.cls || "this class") + " (HUNTING MAIN)";
  var min = to_number(get_variable("basher_health")) || 0;
  var pct = B.maxhp > 0 ? Math.round(B.hp * 100 / B.maxhp) : 100;
  if (!B.low && pct < min) {
    B.low = true;
    display_notice("[basher] health " + pct + "% is under " + min + "%: holding attacks until " + Math.min(100, min + 10) + "%.", "orange");
  } else if (B.low && pct >= Math.min(100, min + 10)) {
    B.low = false;
    display_notice("[basher] health back to " + pct + "%: attacking again.", "lime");
  }
  if (B.low) return "holding for health (" + pct + "%)";
  var t = B.target();
  if (t.why) return t.why;
  var tn = B.targetName(t);
  if (tn && B.shields[tn]) return tn + " is shielded";
  return "";
};

// One look: attack once per recovery. Balance or equilibrium going (onGMCP)
// clears sentAt; an attack that took neither within retryMs is a miss.
B.tick = function () {
  if (!B.on) return;
  // A DIAGNOSE owed for venom confusion goes first, on the first recovery,
  // primed or running, even while holding for health (it helps the curing).
  // In a run the attack follows in the same breath: if DIAGNOSE took the
  // balance the attack just fails, and the loss clears sentAt either way.
  if (B.diag && B.bal && B.eq && get_variable("pauseTriggers") != "on") {
    send_command("diagnose", 1);
    B.diag = false;
    B.diagAt = Date.now();
    if (get_variable("debug") == "on") display_notice("[debug][basher] diagnose", "cyan");
  }
  if (!B.run) return;
  // Out of targets: the run ends, still primed.
  var t = B.target();
  if (t.why) { B.end(t.why); return; }
  var held = B.held();
  B.why = held || ((!B.bal || !B.eq) ? "waiting for balance and equilibrium" : "");
  if (held) return;
  B.rageTick();
  if (B.why) return;
  var now = Date.now();
  if (B.sentAt && now - B.sentAt < B.retryMs) return;
  if (B.sentAt) {
    B.misses++;
    if (B.misses >= B.maxMisses) {
      B.stop("[basher] OFF: " + B.misses + " attacks took no balance or equilibrium. Check your target and HUNTING MAIN, then BASHER ON.", "orange");
      return;
    }
  }
  var cmds = B.commands(B.target().tar);
  if (!cmds.length) return;
  for (var i = 0; i < cmds.length; i++) send_command(cmds[i], 1);
  B.sentAt = now;
  if (get_variable("debug") == "on") display_notice("[debug][basher] " + cmds.join(" | "), "cyan");
};

// "You are confused as to the effects of the venom.": curing can't see what
// the venom did, so DIAGNOSE (Ricardo), unless one is already owed: lines
// before the next recovery all share that one.
B.confused = function () {
  if (!B.on || B.diag) return;
  B.diag = true;
  display_notice("[basher] confused by venom: DIAGNOSE on the next recovery.", "orange");
};

// The run is over (no more targets here): still primed.
B.end = function (why) {
  B.run = false; B.sentAt = 0; B.misses = 0; B.why = "";
  display_notice("[basher] " + why + ": run over, still primed. Attack something to start again.", "cyan");
};

// Your own attack seen while primed: the run starts. That attack is the one
// in flight, so the next goes out on the next recovery (balance and
// equilibrium count as gone until Char.Vitals says otherwise, whichever of
// the line and the vitals came first).
B.begin = function () {
  if (!B.on || B.run) return;
  B.run = true;
  B.runName = "";
  B.sentAt = 0; B.misses = 0;
  B.bal = false; B.eq = false;
  var m = B.main();
  display_notice("[basher] running: " + (m ? m.name.toUpperCase() : "attack") + " on " + (B.target().name || B.target().tar || "your target") + " until the room runs out of them. BASHER STOP stops it.", "lime");
};

// Your attack lines are hunting's (the class's "lines" and the shared ones),
// read only. True when the line is one of them.
B.isAttack = function (line) {
  var hu = B.hunting();
  var e = hu && hu.classes[hu.cls];
  var rows = ((e && e.lines) || []).concat(hu ? (hu.sharedLines || []) : []);
  for (var i = 0; i < rows.length; i++) if (rows[i][0].test(line)) return true;
  return false;
};

// BASHER ON: primed, not attacking yet.
B.start = function () {
  B.on = true; B.run = false;
  B.sentAt = 0; B.misses = 0; B.low = false;
  if (B.loop) clearInterval(B.loop);
  B.loop = setInterval(function () { client.loom.basher.tick(); }, B.tickMs);
};

// The kill switch: stops at once; nothing it sent is left queued, since it
// sends on recovery.
B.stop = function (msg, colour) {
  B.on = false; B.run = false; B.diag = false; B.rageSent = null;
  if (B.loop) { clearInterval(B.loop); B.loop = null; }
  B.sentAt = 0; B.misses = 0; B.low = false; B.why = "";
  if (msg) display_notice(msg, colour || "lime");
};

// A reimport keeps a running basher running, with the new helpers.
if (B.loop) { clearInterval(B.loop); B.loop = null; }
if (B.on) B.loop = setInterval(function () { client.loom.basher.tick(); }, B.tickMs);
