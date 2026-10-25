// roleplay_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, your emote lists and
// settings, and the helpers of the ambient emote engine (rebuilt every run;
// the data is kept).
//
// Ambient emotes (#262): while ROLEPLAY AEM is ON, one emote from the active
// set every <min>-<max> minutes. Lists are kept per kind:
//   "general"        any body, used by every normal class
//   "race:<Race>"    your race's own, skipped in a form
//   "class:<Class>"  one per class; dragons and elemental lords are classes too
// A normal class draws from general + race + class; a form (a dragon or an
// elemental lord) only from its own class list. Each list is filled once from
// the seeds (roleplay_seeds) the first time it's in use; after that it's yours.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.roleplay) client.loom.roleplay = {};
client.loom.registry.roleplay = { version: "0.3.3", keyword: "ROLEPLAY", desc: "{{description}}" };
var RP = client.loom.roleplay;

function rpGet(n) { var v; try { v = get_variable(n); } catch (e) { v = undefined; } return (v === undefined || v === null || ("" + v) === "undefined") ? "" : "" + v; }
function rpJson(n, isList) {
  var raw = rpGet(n), v = null;
  if (raw === "") return null;
  try { v = JSON.parse(raw); } catch (e) { v = null; }
  if (isList) return Array.isArray(v) ? v : null;
  return (v && typeof v == "object" && !Array.isArray(v)) ? v : null;
}

// The switch is remembered from the last session (Ricardo: easy to forget
// it's off), as roleplay_aem_on "1"/"0", the name Loom's old roleplay used
// too; aem_on, older still, is migrated once.
if (rpGet("aem_on") !== "") {
  if (rpGet("roleplay_aem_on") === "") set_variable("roleplay_aem_on", rpGet("aem_on"));
  delete_variable("aem_on");
}
if (typeof window !== "undefined" && window.AEM) { try { clearTimeout(window.AEM.timer); } catch (e) {} window.AEM = null; }

// ---- Data (kept across a rerun) ----------------------------------------
// roleplay_emotes: { key: [{ w: weight, t: text }] }. Text is what follows
// "emote ", with {he} {him} {his} filled from your gender.
if (!RP.lists) {
  RP.lists = {};
  var rpL = rpJson("roleplay_emotes");
  if (rpL) {
    for (var rpK in rpL) {
      if (!rpL.hasOwnProperty(rpK) || !Array.isArray(rpL[rpK])) continue;
      var rpOut = [];
      for (var rpI = 0; rpI < rpL[rpK].length; rpI++) {
        var rpE = rpL[rpK][rpI];
        if (rpE && typeof rpE.t == "string" && rpE.t !== "") rpOut.push({ w: (typeof rpE.w == "number" && rpE.w >= 0 && rpE.w <= 1000) ? rpE.w : 1, t: rpE.t });
      }
      RP.lists[rpK] = rpOut;
    }
  }
}
// roleplay_seeded: { key: 1 } for lists the seeds (or you) have filled, so an
// emptied list stays empty.
if (!RP.seeded) RP.seeded = rpJson("roleplay_seeded") || {};
// Who you are: from GMCP, which sends it only at login, so it's kept.
if (RP.cls === undefined) RP.cls = rpGet("roleplay_class");
if (RP.race === undefined) RP.race = rpGet("roleplay_race");
if (RP.me === undefined) RP.me = rpGet("roleplay_name");
// Your gender as the game states it: SCORE's "Gender : male" line (GMCP
// doesn't send it), kept since SCORE isn't typed every session.
if (RP.gameGender === undefined) RP.gameGender = rpGet("roleplay_game_gender");
if (!/^(he|she|fae)$/.test(RP.gameGender)) RP.gameGender = "";
// A gender word as pronouns: male he, female she, anything else fae.
RP.genderOf = function (w) {
  w = String(w || "").toLowerCase();
  if (!w) return "";
  return w === "male" ? "he" : (w === "female" ? "she" : "fae");
};
RP.learnGender = function (w) {
  var g = RP.genderOf(w);
  if (!g || g === RP.gameGender) return;
  RP.gameGender = g;
  set_variable("roleplay_game_gender", g);
};

// Settings.
RP.gender = rpGet("roleplay_gender");
if (!/^(he|she|fae)$/.test(RP.gender)) RP.gender = "";
var rpTime = rpGet("roleplay_aem_time").split(/\s+/);
RP.min = Number(rpTime[0]);
RP.max = Number(rpTime[1]);
if (!(RP.min >= 1 && RP.max >= RP.min && RP.max <= 600)) { RP.min = 15; RP.max = 19; }
// What holds the emotes back: defences and afflictions by their GMCP name.
RP.quietDefault = ["shroud", "hiding", "cloak", "phased", "asleep", "prone", "stun", "aeon"];
RP.quiet = rpJson("roleplay_quiet", true) || RP.quietDefault.slice(0);

// ---- Runtime (kept across a rerun) ----------------------------------------
if (RP.on === undefined) RP.on = rpGet("roleplay_aem_on") === "1";
if (!RP.defs) RP.defs = {};
if (!RP.affs) RP.affs = {};
if (RP.hurtAt === undefined) RP.hurtAt = 0;
if (RP.sentAt === undefined) RP.sentAt = 0;
if (RP.last === undefined) RP.last = "";
if (RP.sent === undefined) RP.sent = 0;
if (RP.held === undefined) RP.held = "";

RP.retryMs = 60000;     // held back: look again in a minute
RP.fightMs = 30000;     // health lost this recently counts as a fight
RP.bumpMs = 60000;      // your own say or emote pushes the next one back this much
RP.echoMs = 5000;       // your emote's echo right after sending isn't "you"

// ---- Helpers (rebuilt every run) ----------------------------------------
RP.save = function () {
  set_variable("roleplay_emotes", JSON.stringify(RP.lists));
  set_variable("roleplay_seeded", JSON.stringify(RP.seeded));
};
// The class's list: an elder dragon shares its colour's ("Elder Golden
// Dragon" -> "Golden Dragon").
RP.clsKey = function () { return String(RP.cls || "").replace(/^Elder\s+/i, ""); };
RP.setOn = function (on) {
  RP.on = !!on;
  set_variable("roleplay_aem_on", on ? "1" : "0");
};
RP.isForm = function () {
  return /dragon$/i.test(RP.cls || "") || /\blord$/i.test(RP.cls || "");
};
// A form's shared list, for every colour or element: "Dragon" or "Elemental
// Lord" ("" when not in a form).
RP.formKind = function () {
  if (/dragon$/i.test(RP.cls || "")) return "Dragon";
  if (/\blord$/i.test(RP.cls || "")) return "Elemental Lord";
  return "";
};
// The list a word names: GENERAL, RACE, CLASS, FORM (yours now), or
// RACE:<name> / CLASS:<name> / FORM:<name> for any other (underscores for
// spaces). "" when it can't.
RP.keyFor = function (word) {
  var w = String(word || "");
  var m = /^(race|class|form):(.+)$/i.exec(w);
  if (m) {
    var want = m[1].toLowerCase() + ":" + m[2].replace(/_/g, " ").toLowerCase();
    // The spelling already in use (GMCP's), whatever case you typed.
    var mine = ["race:" + RP.race, "class:" + RP.clsKey(), "form:Dragon", "form:Elemental Lord"];
    for (var k in RP.lists) if (RP.lists.hasOwnProperty(k)) mine.push(k);
    for (var j = 0; j < mine.length; j++) if (mine[j].toLowerCase() === want) return mine[j];
    return want.replace(/(:|\s)([a-z])/g, function (a, s, c) { return s + c.toUpperCase(); });
  }
  w = w.toLowerCase();
  if (w === "general") return "general";
  if (w === "race") return RP.race ? "race:" + RP.race : "";
  if (w === "class") return RP.cls ? "class:" + RP.clsKey() : "";
  if (w === "form") return RP.formKind() ? "form:" + RP.formKind() : "";
  return "";
};
RP.label = function (key) {
  if (key === "general") return "general";
  var m = /^(race|class|form):(.+)$/.exec(key);
  return m ? m[2] + (m[1] === "race" ? " (race)" : (m[1] === "form" ? " (every form)" : "")) : key;
};
// What you use now: a form its shared list (every dragon's, every lord's) and
// its own (the colour's, the element's); a normal class general + race + class.
RP.activeKeys = function () {
  if (RP.isForm()) return ["form:" + RP.formKind(), "class:" + RP.clsKey()];
  var k = ["general"];
  if (RP.race) k.push("race:" + RP.race);
  if (RP.cls) k.push("class:" + RP.clsKey());
  return k;
};
// A list in use for the first time takes its seeds (once).
RP.seedKey = function (key) {
  if (RP.seeded[key]) return false;
  var sd = RP.seedFor(key);
  if (!sd.length) return false;
  if (!RP.lists[key]) RP.lists[key] = [];
  // A random handful of a long pool, kept in the pool's order.
  var plan = (RP.seedPlan || {})[key === "general" ? "general" : key.split(":")[0]] || {};
  var n = plan.n || 10, idx = [], i;
  for (i = 0; i < sd.length; i++) idx.push(i);
  for (i = idx.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
  idx = idx.slice(0, n).sort(function (a, b) { return a - b; });
  for (i = 0; i < idx.length; i++) {
    var row = sd[idx[i]];
    var txt = typeof row == "string" ? row : row[1];
    RP.lists[key].push({ w: plan.w || (typeof row == "string" ? 2 : row[0]), t: txt });
  }
  RP.seeded[key] = 1;
  return true;
};
RP.seedFor = function (key) {
  var S = RP.seeds || {};
  if (key === "general") return S.general || [];
  var m = /^(race|class|form):(.+)$/.exec(key);
  var tab = m ? S[m[1]] || {} : {};
  return m ? tab[m[2]] || [] : [];
};
RP.seedActive = function () {
  var k = RP.activeKeys(), any = false;
  for (var i = 0; i < k.length; i++) if (RP.seedKey(k[i])) any = true;
  if (any) RP.save();
};
// The rows a LIST shows and numbers: [{ key, i, e }], the active set or one list.
RP.rows = function (keys) {
  keys = keys || RP.activeKeys();
  var out = [];
  for (var a = 0; a < keys.length; a++) {
    var l = RP.lists[keys[a]] || [];
    for (var b = 0; b < l.length; b++) out.push({ key: keys[a], i: b, e: l[b] });
  }
  return out;
};
// Pronouns: {he} {him} {his}, capitalised as written ({His}).
RP.pron = { he: { he: "he", him: "him", his: "his" }, she: { he: "she", him: "her", his: "her" }, fae: { he: "fae", him: "faen", his: "faes" } };
RP.genderNow = function () { return RP.gender || RP.gameGender || ""; };
RP.hasTokens = function (t) { return /\{(he|him|his)\}/i.test(t); };
RP.fill = function (t) {
  var p = RP.pron[RP.genderNow()];
  return String(t).replace(/\{(he|him|his)\}/gi, function (all, w) {
    if (!p) return all;
    var r = p[w.toLowerCase()];
    return w.charAt(0) === w.charAt(0).toUpperCase() ? r.charAt(0).toUpperCase() + r.slice(1) : r;
  });
};
// Weighted pick from the active set; never the one sent last when there's
// another; emotes with pronouns wait until your gender is known.
RP.pick = function () {
  var rows = RP.rows(), c = [], tot = 0, i;
  var g = !!RP.genderNow();
  for (i = 0; i < rows.length; i++) {
    if (rows[i].e.w > 0 && (g || !RP.hasTokens(rows[i].e.t))) c.push(rows[i].e);
  }
  if (c.length > 1) {
    var keep = [];
    for (i = 0; i < c.length; i++) if (c[i].t !== RP.last) keep.push(c[i]);
    if (keep.length) c = keep;
  }
  for (i = 0; i < c.length; i++) tot += c[i].w;
  if (!tot) return null;
  var r = Math.random() * tot;
  for (i = 0; i < c.length; i++) { r -= c[i].w; if (r <= 0) return c[i]; }
  return c[c.length - 1];
};
// Why an emote can't go now, or "".
RP.holdWhy = function () {
  if (get_variable("pauseTriggers") === "on") return "triggers paused";
  for (var i = 0; i < RP.quiet.length; i++) {
    var q = RP.quiet[i];
    if (RP.defs[q]) return q;
    if (RP.affs[q]) return q;
  }
  if (RP.hurtAt && Date.now() - RP.hurtAt < RP.fightMs) return "fighting";
  return "";
};
RP.send = function (e) {
  RP.last = e.t;
  RP.sentAt = Date.now();
  RP.sent++;
  send_command("emote " + RP.fill(e.t));
};
// The timer. Always calls the current helpers, so a reimport takes over.
RP.at = function (ms) {
  clearTimeout(RP.timer);
  RP.due = Date.now() + ms;
  RP.timer = setTimeout(function () { var R = client.loom.roleplay; R.timer = null; R.tick(); }, ms);
};
RP.schedule = function () {
  RP.at(Math.round((RP.min + Math.random() * (RP.max - RP.min)) * 60000));
};
RP.stop = function () { clearTimeout(RP.timer); RP.timer = null; RP.due = 0; };
RP.tick = function () {
  if (!RP.on) return;
  var why = RP.holdWhy();
  if (why) { RP.held = why; RP.at(RP.retryMs); return; }
  RP.held = "";
  var e = RP.pick();
  if (!e) {
    if (!RP.emptyTold) display_notice("[roleplay] no ambient emote to send for " + (RP.cls || "you") + ". ROLEPLAY AEM ADD to write some.", "orange");
    RP.emptyTold = true;
  } else {
    RP.emptyTold = false;
    RP.send(e);
  }
  RP.schedule();
};
// You spoke or emoted yourself: the next ambient emote waits a minute longer,
// at most the longest wait from now.
RP.bump = function (why) {
  if (!RP.on || !RP.timer) return;
  var now = Date.now();
  if (now - RP.sentAt < RP.echoMs) return;
  var due = Math.min(RP.due + RP.bumpMs, now + RP.max * 60000);
  RP.lastBump = { at: now, why: why || "", by: Math.round((due - RP.due) / 1000) };
  if (due > RP.due) RP.at(due - now);
};
RP.mmss = function (ms) {
  var s = Math.max(0, Math.round(ms / 1000));
  return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2);
};

run_function("roleplay_seeds", [], "roleplay");
RP.seedActive();
// On from the last session: running again (a reimport keeps the timer it has).
if (RP.on && !RP.timer) RP.schedule();
