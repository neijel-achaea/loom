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
client.loom.registry.basher = { version: "0.5.9", keyword: "BASHER", desc: "{{description}}", redraw: function () { if (client.loom.basher && client.loom.basher.draw) client.loom.basher.draw(); } };
var B = client.loom.basher;

// Wimpy (#121, Ricardo): during a run, flee one room back the way you came
// when health or mana falls below these percents (Ricardo: 40 and 20 by
// default; "0" = off), then stay
// primed. It replaces 0.1's hold below a health threshold (basher_health,
// no longer read). BASHER WIMPY DIR is the way out when the way back isn't
// known.
if (!get_variable("basher_flee_health")) set_variable("basher_flee_health", "40");
if (!get_variable("basher_flee_mana")) set_variable("basher_flee_mana", "20");

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
B.fleeing = B.fleeing || null;     // { dir, from, at, sentAt, why } while fleeing
B.lastFight = B.lastFight || null; // { why, id }: finish this mob, nothing after it (#122)

// Priority lists per area (#123, Ricardo): { "Green Lake": [{ name, on, isNew }] },
// in kill order. Every mob type met in an area joins its list ignored (on:
// false, isNew) until you turn it active in the Basher tab. Saved in
// basher_priorities; the area comes from Room.Info.
if (!B.prios) {
  try { B.prios = JSON.parse(get_variable("basher_priorities") || "{}") || {}; } catch (e) { B.prios = {}; }
  // Only areas with a list are kept: anything else saved there (a number,
  // a list, a newer shape) is dropped rather than breaking the tab (#135).
  if (!B.prios || typeof B.prios != "object" || Array.isArray(B.prios)) B.prios = {};
  for (var bsPa in B.prios) { if (B.prios.hasOwnProperty(bsPa) && !Array.isArray(B.prios[bsPa])) delete B.prios[bsPa]; }
}
if (B.area === undefined) B.area = "";
// Your name (GMCP Char.Name / Char.Status), so your own arrival and channel
// lines are told apart; kept across loads, as GMCP sends it only at login.
if (!B.me) B.me = String(get_variable("basher_name") || "");
B.autoTop = B.autoTop || "";       // the queue's top when the basher last set your target
B.gagUntil = B.gagUntil || 0;      // hide the game's "Your target is now" for the basher's own settarget
// Rooms from Room.Info, for the way back: this room's number and exits, and
// the room before it.
if (B.roomNum === undefined) { B.roomNum = ""; B.prevNum = ""; B.exits = {}; }
if (B.mp === undefined) { B.mp = 0; B.maxmp = 0; }
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
// Raze shielded targets (#125) on by default; BASHER RAZE OFF waits for fades.
if (!get_variable("basher_raze")) set_variable("basher_raze", "on");
// Interruptions (#278, Ricardo): one switch for all three (a player arriving,
// a tell, ct naming you), remembered across loads (basher_interrupt). Enemies
// keep their own switch: LOOM LINK social-basher.
if (!get_variable("basher_interrupt")) set_variable("basher_interrupt", "on");
B.interrupts = function () { return get_variable("basher_interrupt") != "off"; };
B.razeAt = B.razeAt || 0;          // when the last raze went out
// A dragon's dragonbreath defence (Blast uses it): true, false, or null when
// no defence update has come since loading (breath raised before the import):
// then Blast is tried once, and a Blast that takes no balance means no breath.
if (B.breath === undefined) B.breath = null;
B.blastAt = B.blastAt || 0;        // a Blast went out at a shield, not yet seen to land

// Afflictions on a mob: [pattern (group 1 = the mob), affliction, on?].
// Add rows as lines are captured; the names are what "when" lists use.
B.affLines = [
  [/^(.+) reels, flinching as clumsiness takes hold\.$/, "clumsiness", true],
  [/^Frost blooms outwards from you, wreathing (.+) in frigid cold as clumsiness takes hold\.$/, "clumsiness", true],
  // Blue Dragon's Ague (Ricardo), yours or another player's: cold and clumsiness.
  [/^(?:You let|\w+ lets) loose a steady stream of cold air around (.+), who begins to shiver uncontrollably\.$/, "clumsiness", true],
  // Magi's Dilation (Ricardo): aeon, until the vortex shatters. Another
  // player's version isn't known yet.
  [/^You summon a polar vortex in a tight field around (.+), chilling the small pocket so intensely that time itself begins to slow\.$/, "aeon", true],
  [/^A sharp crack echoes through the air as the polar vortex surrounding (.+) shatters and \w+ movements return to normal speed\.$/, "aeon", false],
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
  var staff = (client.loom.magi && client.loom.magi.staff) || get_variable("magi_staff") || get_variable("artificing_staff") || "scintilla";
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
B.resolve = function () {
  var mob = function (it) { return /m/.test(it.attrib || "") && !/d/.test(it.attrib || ""); };
  // Finishing the last fight (B.lastFight: an enemy, another player, a tell
  // or the city channel, #122/#118): only the mob being fought then,
  // whatever the target says now (even when the game cleared it after the
  // kill); nothing after it.
  if (B.run && B.lastFight && B.lastFight.id && B.roomKnown) {
    var lf = B.room[B.lastFight.id];
    if (lf && mob(lf)) return { tar: B.lastFight.id, id: B.lastFight.id, name: lf.name, why: "" };
    return { tar: B.lastFight.id, why: "fight over, not starting another (" + B.lastFight.why + ")" };
  }
  var tv = String(get_variable("tar") || "").trim();
  if (tv !== B.tarSeen) { B.tarSeen = tv; B.tarAt = Date.now(); }
  var g = B.game;
  var useGame = !!(g && (g.id || g.name) && (!tv || (g.at || 0) >= (B.tarAt || 0)));
  var tar = useGame ? String(g.id || g.name) : tv;
  if (!tar) return { tar: "", why: "no target" };
  if (B.players[tar.toLowerCase()]) return { tar: tar, why: tar + " is a player here: not attacking" };
  if (!B.roomKnown) return { tar: tar, id: /^\d+$/.test(tar) ? tar : "", why: "" };
  if (/^\d+$/.test(tar)) {
    var it = B.room[tar];
    if (it && mob(it)) { if (B.run) B.runName = it.name; return { tar: tar, id: tar, name: it.name, why: "" }; }
    // That one is dead or gone: during a run, the next living mob with the
    // same name (Ricardo: it goes on until the room runs out of targets).
    if (B.run && B.runName) {
      for (var nx = 0; nx < B.order.length; nx++) {
        var nit = B.room[B.order[nx]];
        if (nit && mob(nit) && nit.name === B.runName) return { tar: B.order[nx], id: B.order[nx], name: B.runName, why: "" };
      }
      return { tar: tar, why: "no more " + B.runName.replace(/^(a|an|the|some)\s+/i, "") + " here" };
    }
    return { tar: tar, why: "target " + tar + " isn't here" };
  }
  var re = new RegExp("\\b" + tar.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b");
  for (var oi = 0; oi < B.order.length; oi++) {
    var oit = B.room[B.order[oi]];
    if (oit && mob(oit) && re.test(String(oit.name).toLowerCase())) return { tar: tar, id: B.order[oi], name: oit.name, why: "" };
  }
  return { tar: tar, why: "no " + tar + " here" };
};

// The target, with priorities (#123): your target while it's a living mob
// here; in a run, once it's gone (dead, left, or the game cleared the target
// after the kill), the next one: by the area's list when it has active mobs
// (the basher sets your target to it), else the next mob with the same name
// (0.1's carry-on). A finished last fight (#122) never chains.
B.target = function () {
  var r = B.resolve();
  if (!r.why || !B.run || B.lastFight || !B.roomKnown) return r;
  if (B.hasList()) {
    var q = B.queue();
    if (q.length) {
      if (B.autoTop !== q[0].id || String((B.game || {}).id) !== q[0].id) B.setTarget(q[0].id);
      return { tar: q[0].id, id: q[0].id, name: q[0].name, why: "" };
    }
    return { tar: r.tar, why: "no more listed mobs here" };
  }
  if (B.runName) {
    for (var i = 0; i < B.order.length; i++) {
      var it = B.room[B.order[i]];
      if (it && /m/.test(it.attrib || "") && !/d/.test(it.attrib || "") && it.name === B.runName) return { tar: B.order[i], id: B.order[i], name: it.name, why: "" };
    }
    return { tar: r.tar, why: "no more " + B.runName.replace(/^(a|an|the|some)\s+/i, "") + " here" };
  }
  return r;
};

// --- Priority lists (#123) ---------------------------------------------------
B.list = function (area) {
  var a = area === undefined ? B.area : area;
  if (!a) return [];
  if (!B.prios[a]) B.prios[a] = [];
  return B.prios[a];
};
B.savePrios = function () { try { set_variable("basher_priorities", JSON.stringify(B.prios)); } catch (e) {} };
B.living = function (it) { return !!it && /m/.test(it.attrib || "") && !/d/.test(it.attrib || ""); };
// Whether this area's list has an active mob: then targeting follows it.
B.hasList = function () {
  var l = B.list();
  for (var i = 0; i < l.length; i++) if (l[i].on) return true;
  return false;
};
// New mob types here join the list, ignored. True when one was added.
B.learn = function () {
  if (!B.area || !B.roomKnown) return false;
  var l = B.list(), known = {}, added = false;
  for (var i = 0; i < l.length; i++) known[l[i].name] = true;
  for (var j = 0; j < B.order.length; j++) {
    var it = B.room[B.order[j]];
    if (B.living(it) && !known[it.name]) { l.push({ name: it.name, on: false, isNew: true }); known[it.name] = true; added = true; }
  }
  if (added) B.savePrios();
  return added;
};
// The kill queue here: living mobs of active types, by the list's order,
// then the room's own order. [{ id, name, rank }] (rank from 1).
// Someone's loyal (room's probe, through the room-basher link): its owner,
// or undefined. Loyals never enter the queue, so they're never auto-targeted.
B.loyalTo = function (id) {
  var LL = client.loom.loom;
  return (LL && LL.answer) ? LL.answer("basher", "mob.loyal", String(id)) : undefined;
};
B.queue = function () {
  var l = B.list(), pos = {}, n = 0;
  for (var i = 0; i < l.length; i++) if (l[i].on) pos[l[i].name] = n++;
  var q = [];
  for (var j = 0; j < B.order.length; j++) {
    var it = B.room[B.order[j]];
    if (B.living(it) && pos[it.name] !== undefined && !B.loyalTo(B.order[j])) q.push({ id: B.order[j], name: it.name, p: pos[it.name], o: j });
  }
  q.sort(function (a, b) { return a.p - b.p || a.o - b.o; });
  for (var k = 0; k < q.length; k++) q[k].rank = k + 1;
  return q;
};
// Edits from the Basher tab: "up"/"down" among the active ones, "toggle"
// (turning one active puts it at the end of the kill order). By index into
// the area's list.
B.prio = function (act, i) {
  var l = B.list();
  var e = l[i];
  if (!e) return;
  e.isNew = false;
  if (act === "toggle") {
    l.splice(i, 1);
    e.on = !e.on;
    if (e.on) {
      var last = -1;
      for (var a = 0; a < l.length; a++) if (l[a].on) last = a;
      l.splice(last + 1, 0, e);
    } else l.push(e);
  } else if (act === "up" || act === "down") {
    if (!e.on) return;
    var step = act === "up" ? -1 : 1, j = i + step;
    while (j >= 0 && j < l.length && !l[j].on) j += step;
    if (j < 0 || j >= l.length) return;
    l[i] = l[j]; l[j] = e;
  }
  B.savePrios();
  B.autoTop = "";
  B.draw();
};

// Set your target in the game (Ricardo: option a, as the Tab key does), the
// game's "Your target is now" line hidden for this one. Remembered at once,
// before the game's IRE.Target.Set comes back.
B.setTarget = function (id) {
  B.autoTop = String(id);
  B.gagUntil = Date.now() + 2000;
  B.game = { id: String(id), name: (B.room[id] || {}).name || "", at: Date.now() };
  send_command("settarget " + id, 1);
  B.draw();
};

// While primed: keep your target on the top of the queue, but only when the
// top changes (a mob arrives, dies or leaves, or the list is edited), so a
// target you pick yourself stays until then. Never attacks.
B.autoTarget = function () {
  if (!B.on || B.run || B.fleeing || !B.roomKnown || !B.hasList() || get_variable("pauseTriggers") == "on") return;
  var q = B.queue();
  var top = q.length ? q[0].id : "";
  if (top === B.autoTop) return;
  B.autoTop = top;
  if (top && String((B.game || {}).id) !== top) B.setTarget(top);
  else B.draw();
};

// Redraw the Basher tab and tell loom (Here shows the queue), soon and once.
// F1 ends the run while one lasts (Ricardo): hunting lays out STOP (BASHER END)
// there whenever client.loom.basher.run is true, so when the run starts or
// ends, hunting's keys are laid out again. Checked on every draw and tick,
// since some paths (fleeing) end the run without drawing.
B.syncKeys = function () {
  var r = !!B.run;
  if (B.keysRun === r) return;
  B.keysRun = r;
  if (client.loom.registry && client.loom.registry.hunting) { try { run_function("hunting_buttons", [], "hunting"); } catch (e) {} }
};

// Other tabs (Here) hear of a change at once, so they can fold it into the
// draw the same GMCP packet already started; the Basher tab itself redraws
// once per burst (#136: Here drew twice per room step).
B.draw = function () {
  B.syncKeys();
  if (client.loom.notify) client.loom.notify("basher");
  if (B.drawT) return;
  B.drawT = setTimeout(function () {
    var b = client.loom.basher;
    b.drawT = null;
    try { run_function("basher_render", [], "basher"); } catch (e) {}
  }, 60);
};

// Clicks in the Basher tab (the page shares window with package scripts but
// can't reach client.*): window.loomBasher.act("up"|"down"|"toggle", i).
try {
  window.loomBasher = { act: function (act, i) { client.loom.basher.prio(String(act), Number(i)); } };
} catch (e) {}

// What other packages may read (through loom's links): the queue for Here.
B.look = {
  queue: function () {
    var b = client.loom.basher;
    var q = b.queue();
    var order = {};
    for (var i = 0; i < q.length; i++) order[q[i].id] = q[i].rank;
    // resolve(), not target(): reading the queue must never set a target.
    var tid = String((b.resolve() || {}).id || "");
    var next = "";
    for (var k = 0; k < q.length; k++) { if (q[k].id !== tid) { next = q[k].id; break; } }
    var on = {}, l = b.list();
    for (var j = 0; j < l.length; j++) on[l[j].name] = l[j].on;
    return { state: !b.on ? "" : (b.fleeing ? "FLEEING" : (b.run ? "RUNNING" : "PRIMED")), listed: b.hasList(), order: order, target: tid, next: next, active: on };
  }
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
  B.razeAt = 0;
  if (B.on && B.run && B.targetName() === n) display_notice("[basher] " + name + " is shielded" + B.razeNote() + ".", "orange");
};
B.shieldDown = function (name) {
  var n = String(name || "").toLowerCase();
  if (!B.shields[n]) return;
  delete B.shields[n];
  if (B.on && B.run && B.targetName() === n) display_notice("[basher] " + name + "'s shield is gone: attacking again.", "lime");
};

// --- Raze (#125) --------------------------------------------------------------
// The class's shieldbreak from hunting (its "razes" with a key, the rage cost
// from "rage"): { name, cost, cmd }, or null (dragons, Alchemist, Runewarden
// and Unnamable have no key for theirs yet; dragons Blast instead, below).
B.razeCmd = function () {
  var hu = B.hunting();
  var e = hu && hu.classes[hu.cls];
  if (!e || !e.razes) return null;
  var keys = e.keys || [];
  for (var r = 0; r < e.razes.length; r++) {
    for (var k = 0; k < keys.length; k++) {
      var ab = (keys[k][2] && keys[k][2] != "main") ? keys[k][2] : keys[k][0];
      if (ab === e.razes[r] && keys[k][1]) return { name: ab, cost: (e.rage && e.rage[ab]) || 0, cmd: keys[k][1] };
    }
  }
  return null;
};
// A balance attack that also breaks a shield (hunting's "razeAttack", by its
// key's label: every dragon's Blast), used when there's no keyed raze above:
// { name, cmd }, or null. Blast uses up the dragonbreath defence (Ricardo:
// brought up as a defence, the basher never summons it), so it waits for one.
B.razeAttack = function () {
  var hu = B.hunting();
  var e = hu && hu.classes[hu.cls];
  if (!e || !e.razeAttack) return null;
  var keys = e.keys || [];
  for (var k = 0; k < keys.length; k++) if (keys[k][0] === e.razeAttack && keys[k][1]) return { name: e.razeAttack, cmd: keys[k][1] };
  return null;
};
// The Blast went out at a shielded target (its breath used, or your balance
// taken): the shield is down.
B.blasted = function () {
  if (!B.blastAt) return;
  B.blastAt = 0;
  var tn = B.targetName();
  if (tn && B.shields[tn]) {
    delete B.shields[tn];
    if (B.on && B.run) display_notice("[basher] " + tn + "'s shield blasted: attacking again.", "lime");
    B.draw();
  }
};
// Whether the run's target is shielded right now.
B.shieldedTarget = function () {
  var tn = B.targetName();
  return !!(tn && B.shields[tn]);
};
// Why it's waiting on a shield, for status: razing, short of rage, or no raze.
B.razeNote = function () {
  if (get_variable("basher_raze") == "off") return " (BASHER RAZE is OFF: waiting for it to fade)";
  var r = B.razeCmd();
  if (!r) {
    var ra = B.razeAttack();
    if (!ra) return " (no raze key for this class: waiting for it to fade)";
    return B.breath !== false ? " (razing with " + ra.name + ")" : " (no dragonbreath for " + ra.name + ": waiting for it to fade)";
  }
  var rage = to_number((B.hunting() || {}).rage);
  return rage < r.cost ? " (" + r.name + " needs " + r.cost + " rage, you have " + rage + ")" : " (razing with " + r.name + ")";
};
// Fire the shieldbreak: no balance or equilibrium needed and no cooldown
// (hunting queues it as battlerage), only its rage. Once, then again after
// 2.5 s while the shield is still up (a missed or lost raze).
B.razeTick = function () {
  if (get_variable("basher_raze") == "off" || get_variable("pauseTriggers") == "on") return;
  var r = B.razeCmd();
  if (!r || to_number((B.hunting() || {}).rage) < r.cost) return;
  var now = Date.now();
  if (B.razeAt && now - B.razeAt < B.rageRetryMs) return;
  var cmds = B.prep(r.cmd, B.target().tar);
  for (var i = 0; i < cmds.length; i++) send_command(cmds[i], 1);
  B.razeAt = now;
  if (get_variable("debug") == "on") display_notice("[debug][basher] raze " + r.name + ": " + cmds.join(" | "), "cyan");
};
// A line saying the shield is gone without fading: your raze's own line (the
// class's line for its "razes" ability: the target's shield), or "Your rage
// is wasted as X is not protected by a shield." (X's). True when it was one.
B.razeLine = function (line) {
  var w = /^Your rage is wasted as (.+) is not protected by a shield\.$/.exec(line);
  if (w) { B.razeAt = 0; B.shieldDown(w[1]); return true; }
  var hu = B.hunting();
  var e = hu && hu.classes[hu.cls];
  if (!e || !e.razes || !e.lines) return false;
  for (var i = 0; i < e.lines.length; i++) {
    var row = e.lines[i];
    if (row[2] && e.razes.indexOf(row[2]) >= 0 && row[0].test(line)) {
      var tn = B.targetName();
      B.razeAt = 0;
      if (tn && B.shields[tn]) {
        delete B.shields[tn];
        if (B.on && B.run) display_notice("[basher] " + tn + "'s shield razed: attacking again.", "lime");
        B.draw();
      }
      return true;
    }
  }
  return false;
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
  if (B.fleeing) return "fleeing " + B.fleeing.dir;
  var t = B.target();
  if (t.why) return t.why;
  var tn = B.targetName(t);
  if (tn && B.shields[tn]) return tn + " is shielded" + B.razeNote();
  return "";
};

// One look: attack once per recovery. Balance or equilibrium going (onGMCP)
// clears sentAt; an attack that took neither within retryMs is a miss.
B.tick = function () {
  B.syncKeys();
  if (!B.on) return;
  // A DIAGNOSE owed for venom confusion goes first, on the first recovery,
  // primed or running (it helps the curing).
  // In a run the attack follows in the same breath: if DIAGNOSE took the
  // balance the attack just fails, and the loss clears sentAt either way.
  if (B.diag && B.bal && B.eq && get_variable("pauseTriggers") != "on") {
    send_command("diagnose", 1);
    B.diag = false;
    B.diagAt = Date.now();
    if (get_variable("debug") == "on") display_notice("[debug][basher] diagnose", "cyan");
  }
  if (B.fleeing) { B.fleeTick(); return; }
  if (!B.run) { B.autoTarget(); return; }
  // Wimpy: health or mana too low, leave the room (before anything else).
  var wimp = B.wimpy();
  if (wimp) { B.flee(wimp); return; }
  // Out of targets: the run ends, still primed.
  var t = B.target();
  if (t.why) { B.end(t.why); return; }
  var held = B.held();
  B.why = held || ((!B.bal || !B.eq) ? "waiting for balance and equilibrium" : "");
  // A shielded target (#125, Ricardo: raze only, swapping later): the class's
  // shieldbreak instead of waiting for the shield to fade.
  // Dragons: Blast on recovery, while dragonbreath is up.
  var blast = null;
  if (held && B.shieldedTarget()) {
    if (B.razeCmd()) { B.razeTick(); return; }
    blast = B.razeAttack();
    if (!blast || B.breath === false || get_variable("basher_raze") == "off" || !B.bal || !B.eq) return;
  } else {
    if (held) return;
    B.rageTick();
    if (B.why) return;
  }
  var now = Date.now();
  if (B.sentAt && now - B.sentAt < B.retryMs) return;
  // A Blast tried on unknown breath that took no balance: there's no breath.
  // Not a miss; it waits for the fade (or for dragonbreath to come up).
  if (B.sentAt && B.blastAt && B.breath === null) {
    B.breath = false; B.blastAt = 0; B.sentAt = 0;
    display_notice("[basher] Blast took no balance: no dragonbreath, waiting for the shield to fade.", "orange");
    return;
  }
  if (B.sentAt) {
    B.misses++;
    if (B.misses >= B.maxMisses) {
      B.stop("[basher] OFF: " + B.misses + " attacks took no balance or equilibrium. Check your target and HUNTING MAIN, then BASHER ON.", "orange");
      return;
    }
  }
  var cmds = blast ? B.prep(blast.cmd, B.target().tar) : B.commands(B.target().tar);
  if (!cmds.length) return;
  for (var i = 0; i < cmds.length; i++) send_command(cmds[i], 1);
  B.sentAt = now;
  B.blastAt = blast ? now : 0;
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

// Health and mana as percents (null while unknown).
B.pct = function (v, max) { return max > 0 ? Math.round(v * 100 / max) : null; };

// The wimpy reason, or "": health or mana under its threshold.
B.wimpy = function () {
  var h = to_number(get_variable("basher_flee_health")) || 0;
  var m = to_number(get_variable("basher_flee_mana")) || 0;
  var hp = B.pct(B.hp, B.maxhp), mp = B.pct(B.mp, B.maxmp);
  if (h > 0 && hp !== null && hp < h) return "health " + hp + "% is under " + h + "%";
  if (m > 0 && mp !== null && mp < m) return "mana " + mp + "% is under " + m + "%";
  return "";
};

// The settings in words, for status and BASHER WIMPY.
B.wimpyText = function () {
  var h = to_number(get_variable("basher_flee_health")) || 0;
  var m = to_number(get_variable("basher_flee_mana")) || 0;
  var d = String(get_variable("basher_flee_dir") || "");
  var w = [];
  if (h > 0) w.push("health under " + h + "%");
  if (m > 0) w.push("mana under " + m + "%");
  return w.length ? "flees on " + w.join(" or ") + ", back the way you came" + (d ? " (else " + d.toUpperCase() + ")" : "") : "never flees";
};

// The way back: the exit here that leads to the room you came from; else
// BASHER WIMPY DIR; "" when neither is known.
B.backDir = function () {
  for (var d in B.exits) {
    if (B.exits.hasOwnProperty(d) && B.prevNum !== "" && String(B.exits[d]) === String(B.prevNum)) return d;
  }
  return String(get_variable("basher_flee_dir") || "");
};

// Start fleeing: one step, the only move the basher ever makes. The step goes
// out on the first balance and equilibrium (fleeTick).
B.flee = function (why) {
  var dir = B.backDir();
  if (!dir) {
    B.run = false; B.sentAt = 0; B.misses = 0; B.why = ""; B.lastFight = null;
    display_notice("[basher] " + why + ", but no way back is known (BASHER WIMPY DIR sets one): run over, not moving. Still primed.", "orange");
    return;
  }
  B.fleeing = { dir: dir, from: B.roomNum, at: Date.now(), sentAt: 0, why: why };
  display_notice("[basher] " + why + ": fleeing " + dir.toUpperCase() + ".", "orange");
  B.fleeTick();
};

// While fleeing: done once the room changes; the step is sent on balance and
// equilibrium, again every 1.5 s while still here; given up after 10 s.
B.fleeTick = function () {
  var f = B.fleeing;
  var now = Date.now();
  if (B.roomNum !== f.from) {
    B.fleeing = null; B.run = false; B.sentAt = 0; B.misses = 0; B.why = ""; B.lastFight = null;
    display_notice("[basher] fled " + f.dir.toUpperCase() + ". Still primed: attack something to start again.", "lime");
    return;
  }
  if (now - f.at > 10000) {
    B.fleeing = null; B.run = false; B.sentAt = 0; B.misses = 0; B.why = ""; B.lastFight = null;
    display_notice("[basher] couldn't flee " + f.dir.toUpperCase() + " (still here after 10 s): run over. Still primed.", "orange");
    return;
  }
  if (get_variable("pauseTriggers") == "on" || !B.bal || !B.eq) return;
  if (f.sentAt && now - f.sentAt < 1500) return;
  send_command(f.dir, 1);
  f.sentAt = now;
};

// The run is over (no more targets here): still primed.
// Finish only the fight in progress (#122 an enemy arrived; #118 will use it
// for players and tells too): the mob being fought now is the last one, then
// the run ends and the basher waits primed. Nothing is cut short.
B.finishOnly = function (why) {
  if (!B.on || !B.run || B.lastFight) return;
  var t = B.target();
  B.lastFight = { why: why, id: t.id || "" };
  display_notice("[basher] " + why + ": finishing " + (t.name || "this fight") + ", nothing new after it.", "orange");
};

// Someone arrived in the room (onGMCP Room.AddPlayer): during a run, any
// other player means this fight is the last (#118, Ricardo); an enemy (social's
// enemies list, through loom's social-basher link, #122) says so. Players
// already here when the run started don't count.
B.arrived = function (name) {
  if (!B.on || !B.run || B.lastFight) return;
  if (B.me && String(name).toLowerCase() === B.me.toLowerCase()) return;
  var L = client.loom.loom;
  var enemy = L && L.answer ? L.answer("basher", "person.enemy", name) : undefined;
  // With BASHER INTERRUPT OFF only an enemy (link social-basher) still counts.
  if (!enemy && !B.interrupts()) return;
  B.finishOnly(name + (enemy ? " (enemy)" : "") + " is here");
};

// A line on a channel (onGMCP Comm.Channel.Text): during a run, a tell to you
// or a line on your city's channel (ct) that names you makes this fight the
// last (#118, Ricardo: only these for now, and ct only when it mentions you;
// says naming you are left out, since denizens call your name mid-fight).
// Your own lines don't count.
B.heard = function (channel, talker, text) {
  if (!B.on || !B.run || B.lastFight || !B.interrupts()) return;
  var ch = String(channel || "").toLowerCase(), who = String(talker || "");
  if (!who || (B.me && who.toLowerCase() === B.me.toLowerCase())) return;
  if (/^tell\s/.test(ch)) B.finishOnly(who + " sent you a tell");
  else if (ch === "ct" && B.me && new RegExp("\\b" + B.me + "\\b", "i").test(String(text || ""))) B.finishOnly(who + " named you on the city channel");
};

B.end = function (why) {
  B.run = false; B.sentAt = 0; B.misses = 0; B.why = ""; B.lastFight = null; B.autoTop = ""; B.draw();
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
  B.lastFight = null;
  B.draw();
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
  B.on = true; B.run = false; B.autoTop = ""; B.draw();
  B.sentAt = 0; B.misses = 0; B.fleeing = null;
  if (B.loop) clearInterval(B.loop);
  B.loop = setInterval(function () { client.loom.basher.tick(); }, B.tickMs);
};

// The kill switch: stops at once; nothing it sent is left queued, since it
// sends on recovery.
B.stop = function (msg, colour) {
  B.on = false; B.run = false; B.diag = false; B.rageSent = null; B.fleeing = null; B.lastFight = null; B.autoTop = ""; B.draw();
  if (B.loop) { clearInterval(B.loop); B.loop = null; }
  B.sentAt = 0; B.misses = 0; B.fleeing = null; B.why = "";
  if (msg) display_notice(msg, colour || "lime");
};

// A reimport keeps a running basher running, with the new helpers.
if (B.loop) { clearInterval(B.loop); B.loop = null; }
if (B.on) B.loop = setInterval(function () { client.loom.basher.tick(); }, B.tickMs);

// The tab (and Here, through loom) drawn once on load.
B.draw();
