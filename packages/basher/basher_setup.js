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
client.loom.registry.basher = { version: "0.1.0", keyword: "BASHER", desc: "{{description}}" };
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
B.why = B.why || "";               // why it isn't attacking right now (status)

B.tickMs = 250;    // how often the loop looks
B.retryMs = 2500;  // an attack that took no balance by then is counted as a miss
B.maxMisses = 3;   // that many in a row: the basher switches itself off

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
  if (!main) return [];
  var staff = (client.loom.artificing && client.loom.artificing.staff) || get_variable("artificing_staff") || "scintilla";
  var dragon = get_variable("hunting_dragon_attack") || "gut";
  var party = get_variable("hunting_party_target") || "";
  var parts = String(main.cmd).split("|");
  var out = [];
  for (var i = 0; i < parts.length; i++) {
    var c = parts[i].trim().replace(/^queue\s+add\s+\S+\s+/i, "");
    c = c.replace(/\{staff\}/g, staff).replace(/\{dragon\}/g, dragon).replace(/\{target\}/g, party).replace(/@tar\b/gi, tar).trim();
    if (c) out.push(c);
  }
  return out;
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
  if (!B.bal || !B.eq) return "waiting for balance and equilibrium";
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
  B.why = B.blocked();
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
  B.on = false; B.run = false; B.diag = false;
  if (B.loop) { clearInterval(B.loop); B.loop = null; }
  B.sentAt = 0; B.misses = 0; B.low = false; B.why = "";
  if (msg) display_notice(msg, colour || "lime");
};

// A reimport keeps a running basher running, with the new helpers.
if (B.loop) { clearInterval(B.loop); B.loop = null; }
if (B.on) B.loop = setInterval(function () { client.loom.basher.tick(); }, B.tickMs);
