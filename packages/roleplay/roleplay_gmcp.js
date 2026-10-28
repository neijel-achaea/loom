// roleplay_gmcp -- the work behind onGMCP and the line trigger, as functions
// made once per load (client.loom.hooks.roleplay.gmcp / .line), so the scripts
// that run on every message and line stay two lines (#136). Run from onLoad
// and onInstall, so a reimport replaces them.
if (!client.loom) client.loom = {};
if (!client.loom.hooks) client.loom.hooks = {};
if (!client.loom.hooks.roleplay) client.loom.hooks.roleplay = {};

// Who you are (name, race, class, gender), your health and balance (a fight holds the
// emotes back), and the defences and afflictions in ROLEPLAY QUIET.
client.loom.hooks.roleplay.gmcp = function (args) {
  var rpM = String((args && args.gmcp_method) || "");
  if (!/^Char\.|^Comm\.Channel\.Text$/.test(rpM)) return;
  var rpA = args.gmcp_args;
  if (typeof rpA === "string") { try { rpA = JSON.parse(rpA); } catch (e) { rpA = null; } }
  if (!rpA || typeof rpA != "object") return;
  if (!client.loom || !client.loom.roleplay || !client.loom.roleplay.lists) run_function("roleplay_setup", [], "roleplay");
  var RP = client.loom.roleplay;
  var i;
  if (rpM === "Comm.Channel.Text") {
    // Your own say or yell, in any voice or accent: the talker is you, or the
    // text starts "You ..." / "Your ...".
    if (RP.on && /^(says?|yells?)$/i.test(String(rpA.channel || ""))) {
      var plain = String(rpA.text || "").replace(/\u001b\[[0-9;]*m/g, "").replace(/^\([^)]*\):?\s*/, "");
      if ((RP.me && String(rpA.talker || "").toLowerCase() === RP.me.toLowerCase()) || /^Your?\b/.test(plain)) RP.bump("you spoke");
    }
  } else if (rpM === "Char.Vitals") {
    var hp = Number(rpA.hp);
    if (!isNaN(hp)) {
      if (RP.lastHp !== undefined && hp < RP.lastHp) RP.hurtAt = Date.now();
      RP.lastHp = hp;
    }
    // Balance or equilibrium spent (an attack, but also harvesting and the
    // like): a fight may be on even without health lost (#423).
    var bal = String(rpA.bal), eq = String(rpA.eq);
    if ((RP.lastBal === "1" && bal === "0") || (RP.lastEq === "1" && eq === "0")) RP.actAt = Date.now();
    if (bal === "0" || bal === "1") RP.lastBal = bal;
    if (eq === "0" || eq === "1") RP.lastEq = eq;
  } else if (rpM === "Char.Name" || rpM === "Char.Status") {
    if (rpA.name && String(rpA.name) !== RP.me) { RP.me = String(rpA.name); set_variable("roleplay_name", RP.me); }
    // Not sent by Achaea today (SCORE's line is read instead), kept in case it is.
    if (rpA.gender) RP.learnGender(rpA.gender);
    var changed = false;
    // A form's race (a dragon's) isn't your race: keep the one you had.
    if (rpA.race && !/dragon|lord/i.test(String(rpA.race)) && String(rpA.race) !== RP.race) {
      RP.race = String(rpA.race); set_variable("roleplay_race", RP.race); changed = true;
    }
    if (rpA["class"] && String(rpA["class"]) !== RP.cls) {
      RP.cls = String(rpA["class"]); set_variable("roleplay_class", RP.cls); changed = true;
    }
    if (changed) { RP.emptyTold = false; RP.seedActive(); }
  } else if (rpM === "Char.Defences.List" || rpM === "Char.Afflictions.List") {
    var set = {};
    if (Array.isArray(rpA)) for (i = 0; i < rpA.length; i++) if (rpA[i] && rpA[i].name) set[rpA[i].name] = 1;
    if (rpM === "Char.Defences.List") RP.defs = set; else RP.affs = set;
  } else if (rpM === "Char.Defences.Add" || rpM === "Char.Afflictions.Add") {
    if (rpA.name) (rpM === "Char.Defences.Add" ? RP.defs : RP.affs)[rpA.name] = 1;
  } else if (rpM === "Char.Defences.Remove" || rpM === "Char.Afflictions.Remove") {
    var tab = rpM === "Char.Defences.Remove" ? RP.defs : RP.affs;
    if (Array.isArray(rpA)) for (i = 0; i < rpA.length; i++) delete tab[rpA[i] && rpA[i].name ? rpA[i].name : rpA[i]];
  }
};

// Your own emote: a line starting with your name (after an optional
// parenthesis), its echo. Pushes the next ambient emote back. Says come
// through GMCP above, whatever the voice.
client.loom.hooks.roleplay.line = function (args) {
  var RP = client.loom && client.loom.roleplay;
  if (!RP || !RP.on || !RP.bump || !RP.me) return;
  if (String((args && args[1]) || "") === RP.me) RP.bump("you emoted");
};
