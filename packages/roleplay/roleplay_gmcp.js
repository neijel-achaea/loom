// roleplay_gmcp -- the work behind onGMCP and the line trigger, as functions
// made once per load (client.loom.hooks.roleplay.gmcp / .line), so the scripts
// that run on every message and line stay two lines (#136). Run from onLoad
// and onInstall, so a reimport replaces them.
if (!client.loom) client.loom = {};
if (!client.loom.hooks) client.loom.hooks = {};
if (!client.loom.hooks.roleplay) client.loom.hooks.roleplay = {};

// Who you are (name, race, class, gender), your health (a fight holds the
// emotes back), and the defences and afflictions in ROLEPLAY QUIET.
client.loom.hooks.roleplay.gmcp = function (args) {
  var rpM = String((args && args.gmcp_method) || "");
  if (!/^Char\./.test(rpM)) return;
  var rpA = args.gmcp_args;
  if (typeof rpA === "string") { try { rpA = JSON.parse(rpA); } catch (e) { rpA = null; } }
  if (!rpA || typeof rpA != "object") return;
  if (!client.loom || !client.loom.roleplay || !client.loom.roleplay.lists) run_function("roleplay_setup", [], "roleplay");
  var RP = client.loom.roleplay;
  var i;
  if (rpM === "Char.Vitals") {
    var hp = Number(rpA.hp);
    if (!isNaN(hp)) {
      if (RP.lastHp !== undefined && hp < RP.lastHp) RP.hurtAt = Date.now();
      RP.lastHp = hp;
    }
  } else if (rpM === "Char.Name" || rpM === "Char.Status") {
    if (rpA.name && String(rpA.name) !== RP.me) { RP.me = String(rpA.name); set_variable("roleplay_name", RP.me); }
    if (rpA.gender) {
      var g = String(rpA.gender).toLowerCase();
      RP.gmcpGender = /^m/.test(g) ? "he" : (/^f/.test(g) ? "she" : "");
    }
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

// Your own roleplay: "You say/ask/exclaim/yell ..." or a line starting with
// your name (your emote's echo). Either pushes the next ambient emote back.
client.loom.hooks.roleplay.line = function (args) {
  var RP = client.loom && client.loom.roleplay;
  if (!RP || !RP.on || !RP.bump) return;
  var w = String((args && args[1]) || "");
  if (w.indexOf("You ") === 0 || (RP.me && w === RP.me)) RP.bump();
};
