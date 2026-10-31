// defcon_skills -- skill defences the character hasn't learned yet (#173).
// Run from defcon_setup: the helpers are made afresh every run, the data kept.
//
// What the game tells (Ricardo's probes, 2026-10-31):
//   Char.Skills.Get {group} -> Char.Skills.List: EVERY ability in the group,
//     learned or not (an alt knowing three of Vision got all 34). Used only to
//     know which defences are abilities, and in which group.
//   Char.Skills.Get {group, name} -> Char.Skills.Info { group, skill, info }:
//     info starts "*** You have not yet learned this ability ***" when it
//     isn't learned. Nexus opens a popup for every Info, so while DEFCON's
//     questions are out it wraps Nexus's GMCP handler and keeps the answers
//     it asked for away from it; everything else passes through, and the
//     handler goes back as it was once the answers are in (or after
//     D.skillMs). An ability you look up yourself still pops up.
//
// Checked at DEFCON INIT (so at login, with INIT AUTO on) and when the class
// changes. A defence is a skill when its name (or its curing name, D.defNames)
// is an ability in one of your groups; herbs, salves and elixirs never are,
// and stay as before. Unlearned ones are left out of curing at every level
// (D.isOff), and the change goes to the game at once.
//   D.abilities   ability -> group, from the lists
//   D.unlearned   ability -> 1, from the last check
//   D.sk          the check under way, or null
var D = client.loom.defcon;
if (!D.abilities) D.abilities = {};
if (!D.unlearned) D.unlearned = {};
if (D.sk === undefined) D.sk = null;
D.skillMs = 8000;
// Some groups never answer a list request (Ricardo's Serpent alt, 2026-10-31:
// Constitution, Thermology, Frost, Antidotes, Fitness, Galvanism and
// Philosophy, likely groups without abilities of their own), so the lists
// aren't all waited for: each one that comes restarts a short wait
// (D.skillListMs), and when none has come for that long the check goes on.
D.skillListMs = 1500;
D.skillListWait = function (sk, ms) {
  clearTimeout(sk.lt);
  sk.lt = setTimeout(function () { if (D.sk === sk && sk.phase === "lists") D.skillInfo(); }, ms);
};
D.skillMark = /^\s*\*+\s*You have not yet learned this ability/i;

// The ability a defence stands for, or "" when it isn't one.
D.abilityOf = function (def) {
  var n = String(def || "").toLowerCase();
  if (D.abilities[n]) return n;
  var a = D.defNames && D.defNames[n];
  return (a && D.abilities[a]) ? a : "";
};
// A defence left out because its ability isn't learned.
D.isOff = function (def) {
  var a = D.abilityOf(def);
  return !!(a && D.unlearned[a]);
};

D.skillCheck = function (why) {
  if (typeof send_GMCP != "function") return false;
  D.skillUnwrap();
  if (D.sk && D.sk.t) clearTimeout(D.sk.t);
  var sk = { why: why || "", phase: "groups", lists: {}, ask: {}, unlearned: {}, learned: {}, at: Date.now() };
  D.sk = sk;
  sk.t = setTimeout(function () { if (D.sk === sk) D.skillFinish("timeout"); }, D.skillMs);
  try { send_GMCP("Char.Skills.Get", {}); } catch (e) {}
  // The groups may already be known from login: no need to wait for them.
  if (D.groups && D.groups.length) D.skillLists();
  return true;
};

// Ask for every group's ability list (no popups for these).
D.skillLists = function () {
  var sk = D.sk;
  if (!sk || sk.phase !== "groups") return;
  sk.phase = "lists";
  var gs = D.groups || [];
  for (var i = 0; i < gs.length; i++) {
    sk.lists[gs[i]] = 1;
    try { send_GMCP("Char.Skills.Get", { group: gs[i] }); } catch (e) {}
  }
  if (!gs.length) { D.skillFinish("no groups"); return; }
  D.skillListWait(sk, D.skillListMs * 2);
};

// From the GMCP hook: Char.Skills.Groups and Char.Skills.List.
D.skillGroups = function (list) {
  var out = [];
  if (Array.isArray(list)) {
    for (var i = 0; i < list.length; i++) {
      var g = list[i] && (typeof list[i] == "object" ? list[i].name : list[i]);
      if (g) out.push(String(g).toLowerCase());
    }
  }
  if (!out.length) return;
  D.groups = out;
  if (D.sk && D.sk.phase === "groups") D.skillLists();
};
D.skillList = function (g) {
  var grp = String((g && g.group) || "").toLowerCase();
  var ls = (g && Array.isArray(g.list)) ? g.list : [];
  if (!grp) return;
  for (var i = 0; i < ls.length; i++) D.abilities[String(ls[i]).toLowerCase()] = grp;
  var sk = D.sk;
  if (!sk || sk.phase !== "lists" || !sk.lists[grp]) return;
  delete sk.lists[grp];
  for (var k in sk.lists) { if (sk.lists.hasOwnProperty(k)) { D.skillListWait(sk, D.skillListMs); return; } }
  D.skillInfo();
};

// Ask about each ability in the class's table, with the popups kept away.
D.skillInfo = function () {
  var sk = D.sk;
  if (!sk) return;
  clearTimeout(sk.lt);
  sk.silent = Object.keys(sk.lists);
  sk.phase = "info";
  run_function("defcon_table", [], "defcon");
  var defs = (D.tbl && D.tbl.defs) || [], n = 0;
  for (var i = 0; i < defs.length; i++) {
    var a = D.abilityOf(defs[i][0]);
    if (a && !sk.ask[a]) { sk.ask[a] = D.abilities[a]; n++; }
  }
  if (!n) { D.skillFinish("no skills"); return; }
  if (!D.skillWrap()) { D.skillFinish("no handler"); return; }
  for (var k in sk.ask) {
    if (sk.ask.hasOwnProperty(k)) { try { send_GMCP("Char.Skills.Get", { group: sk.ask[k], name: k }); } catch (e) {} }
  }
};

// The wrap: only while answers are due; a no-op once it's done, even if
// something else (LOOM PERF) has wrapped on top of it meanwhile.
D.skillWrap = function () {
  var dh = client && client._datahandler;
  if (!dh || typeof dh.handle_GMCP != "function") return false;
  if (D.skW && D.skW.on) return true;
  var orig = dh.handle_GMCP;
  var w = { on: true, orig: orig };
  w.fn = function (method, data) {
    if (w.on && method === "Char.Skills.Info" && D.sk && D.sk.phase === "info") {
      var p = data;
      if (typeof p == "string") { try { p = JSON.parse(p); } catch (e) { p = null; } }
      var name = p && p.skill ? String(p.skill).toLowerCase() : "";
      if (name && D.sk.ask.hasOwnProperty(name)) {
        if (D.skillMark.test(String(p.info || ""))) D.sk.unlearned[name] = 1; else D.sk.learned[name] = 1;
        delete D.sk.ask[name];
        var left = false;
        for (var k in D.sk.ask) { if (D.sk.ask.hasOwnProperty(k)) { left = true; break; } }
        if (!left) setTimeout(function () { if (D.sk && D.sk.phase === "info") D.skillFinish("answered"); }, 0);
        return;
      }
    }
    return orig.apply(this, arguments);
  };
  dh.handle_GMCP = w.fn;
  w.dh = dh;
  D.skW = w;
  return true;
};
D.skillUnwrap = function () {
  var w = D.skW;
  if (!w) return;
  w.on = false;
  if (w.dh && w.dh.handle_GMCP === w.fn) w.dh.handle_GMCP = w.orig;
  D.skW = null;
};

// "You have learned the SECRETS ability!" (Ricardo, 2026-10-31): the line
// names the ability, so it's marked learned at once, with no question to the
// game; a defence it stands for goes back into curing at the current level.
D.skillLearned = function (name) {
  var a = String(name || "").toLowerCase().trim();
  if (!a || !D.unlearned[a]) return;
  delete D.unlearned[a];
  run_function("defcon_table", [], "defcon");
  var defs = (D.tbl && D.tbl.defs) || [], back = [], q = [], lvl = D.level;
  for (var i = 0; i < defs.length; i++) {
    if (D.abilityOf(defs[i][0]) !== a) continue;
    back.push(defs[i][0]);
    if (lvl !== undefined && lvl !== null && defs[i][1] >= lvl) q.push("curing priority defence " + defs[i][0] + " " + defs[i][2]);
  }
  if (!back.length) return;
  var off = [];
  for (var j = 0; j < defs.length; j++) { if (D.isOff(defs[j][0])) off.push(defs[j][0]); }
  D.skillSaid = off.slice().sort().join(",");
  display_notice("[defcon] " + back.join(", ") + " learned: back in curing" + (q.length ? " at DEFCON " + lvl : "") + ".", "lime");
  if (q.length) {
    D.queue = (D.queue || []).concat(q);
    if (!D.timer) run_function("defcon_drain", [], "defcon");
  }
  if (client.loom.notify) client.loom.notify("defcon");
};

// The check is over: what changed reaches curing at the current level.
D.skillFinish = function (how) {
  var sk = D.sk;
  if (!sk) return;
  D.sk = null;
  clearTimeout(sk.t);
  clearTimeout(sk.lt);
  D.skillUnwrap();
  // Abilities that went unanswered keep what the last check found.
  var was = D.unlearned, now = {};
  for (var a in was) { if (was.hasOwnProperty(a) && sk.ask.hasOwnProperty(a)) now[a] = 1; }
  for (var u in sk.unlearned) { if (sk.unlearned.hasOwnProperty(u)) now[u] = 1; }
  D.unlearned = now;
  D.skillLast = { how: how, why: sk.why, at: Date.now(), asked: Object.keys(sk.learned).length + Object.keys(sk.unlearned).length, unanswered: Object.keys(sk.ask), silent: sk.silent || Object.keys(sk.lists) };
  run_function("defcon_table", [], "defcon");
  var defs = (D.tbl && D.tbl.defs) || [], off = [], q = [];
  var lvl = D.level, first = !D.skillDone;
  for (var i = 0; i < defs.length; i++) {
    var n = defs[i][0], ab = D.abilityOf(n);
    if (!ab) continue;
    var isOff = !!now[ab], wasOff = !!was[ab];
    if (isOff) off.push(n);
    if (lvl === undefined || lvl === null || defs[i][1] < lvl) continue;
    // Wanted at this level: left out now (or first check this session, in
    // case the game still has it from before), or learned since.
    if (isOff && (!wasOff || first)) q.push("curing priority defence " + n + " reset");
    else if (!isOff && wasOff) q.push("curing priority defence " + n + " " + defs[i][2]);
  }
  D.skillDone = true;
  var key = off.slice().sort().join(",");
  if (off.length && key !== D.skillSaid) display_notice("[defcon] not learned yet, left out of curing: " + off.join(", ") + ".", "cyan");
  else if (!off.length && D.skillSaid) display_notice("[defcon] every skill defence in " + D.tbl.name + " is learned now: back in curing.", "lime");
  D.skillSaid = key;
  if (q.length) {
    D.queue = (D.queue || []).concat(q);
    if (!D.timer) run_function("defcon_drain", [], "defcon");
  }
  if (client.loom.notify) client.loom.notify("defcon");
};
