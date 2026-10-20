// social_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, migration, lists, watchlist.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.social) client.loom.social = {};
// redraw: how loom redraws the Online tab when an integration's source changes (#159).
// The redraw also forgets the standing colours cached for name colouring
// (#60), since it runs when standings changes or a link into social flips;
// in standings mode it passes the change on to the tabs that show social's
// colours (Here, Comms).
// busy (#318): true while a QW poll's answer is still coming, so Here's
// loyal probe waits its turn. A capture open for 5 s no longer counts.
client.loom.registry.social = { version: "0.4.9", keyword: "SOCIAL", desc: "{{description}}", busy: function () {
  var Sq = client.loom.social;
  return !!(Sq && Sq.capturing && Date.now() - (Sq.capAt || 0) < 5000);
}, redraw: function () {
  var So = client.loom.social;
  if (So) { So.standCache = {}; So.standCacheN = 0; }
  run_function("social_online", [], "social");
  if (So && So.colourBy === "standings" && client.loom.notify) client.loom.notify("social");
} };
var S = client.loom.social;

// Groups in priority order: a name in two groups takes the colour of the first.
S.groups = ["family", "enemies", "order", "house", "city", "allies", "friends"];
S.defColor = { family: "#30c4ff", enemies: "#ff5f5f", order: "#e0b8ff", house: "#b8ff29", city: "#27f5c5", allies: "#ff9f4f", friends: "#ffd77f", self: "#fdff4d" };

// One-time migration from the hl*/wl* variables, then cleared.
var soOldVar = { family: "hlFamily", enemies: "hlEnemies", order: "hlOrder", house: "hlHouse", city: "hlCity", allies: "hlAllies", friends: "hlFriends" };
var soLists = get_variable("social_lists");
var soColors = get_variable("social_colors");
var soMig = false;
if (!soLists) {
  soLists = {};
  for (var soI = 0; soI < S.groups.length; soI++) {
    var soG = S.groups[soI];
    var soRaw = get_variable(soOldVar[soG]);
    soLists[soG] = soRaw ? String(soRaw) : "";
    if (soRaw !== null && soRaw !== undefined) { delete_variable(soOldVar[soG]); soMig = true; }
  }
  set_variable("social_lists", soLists);
}
if (!soColors) {
  soColors = {};
  for (var soJ = 0; soJ < S.groups.length; soJ++) {
    var soC = get_variable("hlColor_" + S.groups[soJ]);
    if (soC && soC != S.defColor[S.groups[soJ]]) soColors[S.groups[soJ]] = soC;
    if (soC !== null && soC !== undefined) delete_variable("hlColor_" + S.groups[soJ]);
  }
  set_variable("social_colors", soColors);
}
var soWlOld = [["wlEnabled", "social_poll"], ["wlDebug", "social_debug"], ["wlWatch", "social_watch"]];
for (var soK = 0; soK < soWlOld.length; soK++) {
  var soOv = get_variable(soWlOld[soK][0]);
  if (soOv === null || soOv === undefined) continue;
  var soNv = get_variable(soWlOld[soK][1]);
  if (soNv === null || soNv === undefined) {
    if (soWlOld[soK][0] == "wlWatch") set_variable("social_watch", String(soOv));
    else set_variable(soWlOld[soK][1], String(soOv) === "1" ? "on" : "off");
  }
  delete_variable(soWlOld[soK][0]);
}
if (!get_variable("social_poll")) set_variable("social_poll", "on");
if (!get_variable("social_debug")) set_variable("social_debug", "off");
if (get_variable("social_watch") === null || get_variable("social_watch") === undefined) set_variable("social_watch", S.groups.join(","));
if (soMig) display_notice("[social] lists carried over from the hl* variables.", "cyan");

// Lists: S.lists[group] = { lowercasename: true }. Kept as the same objects
// across re-setups so readers holding a reference stay current.
if (!S.lists) S.lists = {};
for (var soL = 0; soL < S.groups.length; soL++) {
  var soGr = S.groups[soL];
  S.lists[soGr] = S.lists[soGr] || {};
  for (var soKey in S.lists[soGr]) delete S.lists[soGr][soKey];
  var soNames = String(soLists[soGr] || "").split(",");
  for (var soN = 0; soN < soNames.length; soN++) {
    var soNm = soNames[soN].trim().toLowerCase();
    if (soNm.length) S.lists[soGr][soNm] = true;
  }
}
S.color = {};
for (var soCk in S.defColor) S.color[soCk] = soColors[soCk] || S.defColor[soCk];

// Watchlist (online/offline notices for listed names, from polling QW).
S.watch = {};
var soW = String(get_variable("social_watch") || "").split(",");
for (var soWi = 0; soWi < soW.length; soWi++) { if (soW[soWi].trim()) S.watch[soW[soWi].trim()] = true; }
S.debug = get_variable("social_debug") == "on";
// Time between QW polls (#290): SOCIAL POLL EVERY <seconds>, saved in
// social_poll_every, 5s by default. S.restart() puts the timer on it.
S.minEvery = 3; S.maxEvery = 600;
var soEv = parseInt(get_variable("social_poll_every"), 10);
S.interval = (soEv >= S.minEvery && soEv <= S.maxEvery ? soEv : 5) * 1000;
S.restart = function () {
  if (S.timer) clearInterval(S.timer);
  S.timer = setInterval(function () { run_function("social_poll", [], "social"); }, S.interval);
};
if (S.prev === undefined) S.prev = null;
S.capturing = false;
// The Online tab (#76): when each online person was first seen, recent
// arrivals and departures (glow / greyed for S.flashMs), the last poll and
// QW's hidden and total counts.
if (!S.since) S.since = {};
// Your own login: whoever was already online when you came on (no login of
// theirs seen) counts from here. Set again by Char.Name, which the game sends
// at login; until then, from when this package was set up.
if (!S.loginAt) S.loginAt = Date.now();
if (!S.flash) S.flash = {};
S.flashMs = 10000;
// When each listed person was last seen online (social_seen, name -> ms),
// for the tab's Offline section. Only names in a list are kept, so it stays
// small. Written when someone logs off, and at most once a minute otherwise.
if (!S.seen) {
  try { S.seen = JSON.parse(get_variable("social_seen") || "{}") || {}; } catch (e) { S.seen = {}; }
}
if (S.seenSaved === undefined) S.seenSaved = 0;
// Offline section shown or folded (social_offline on/off, default on).
S.showOffline = get_variable("social_offline") != "off";
// Enemies sync (SOCIAL SYNC): your city's enemies list replaces the enemies
// group whenever the game shows it. Saved; on unless set off.
S.syncEnemies = get_variable("social_sync_enemies") != "off";
if (S.lastPoll === undefined) S.lastPoll = 0;
S.buf = [];
if (!S.lastCount) S.lastCount = 0;
// A line of QW names: wrapped lines end in "," or "and", or start with "and" (#75).
S.reNames = /^(?:and\s+)?[A-Z][a-z]+(?:(?:,\s*(?:and\s+)?|\s+and\s+)[A-Z][a-z]+)*(?:,|,?\s+and|\.)?$/;
// QW's last line: "Plus another N whose presence you cannot fully sense (M
// total)." when someone is hidden, else just "(M total)." on its own or after
// the last names.
S.reFooter = /^Plus another \d+|\(\d+ total\)\.?\s*$/;
S.reWord = /[A-Z][a-z]+/g;
if (S.timer) clearInterval(S.timer);
// The pre-0.2 package kept its own 5s QW timer on client.wl. After importing
// over it, that timer would keep polling with no trigger left to gag the
// output, so stop it.
if (client.wl) {
  if (client.wl.timer) clearInterval(client.wl.timer);
  if (client.wl.safetyT) clearTimeout(client.wl.safetyT);
  if (client.wl.flushT) clearTimeout(client.wl.flushT);
  client.wl.enabled = false;
  client.wl = null;
}
S.restart();

// The read-only look other tabs see through loom's display entry point
// (#159): what social knows about a person, never its variables. Groups in
// priority order, so a name in two groups takes the first one's colour, as
// in the game's highlights. Every group counts here, watched or not.
// Name colouring (#60): by group (the default) or by standing band, from
// SOCIAL COLOURS GROUPS|STANDINGS (social_colour_by). In standings mode
// groups are ignored (Ricardo): a person on the books takes the band's
// colour, asked of loom as social's own question person.colour (link
// standings-social); anyone else stays plain. Answers are cached per name
// until the next redraw, since the line trigger asks for every capitalised word.
S.colourBy = get_variable("social_colour_by") === "standings" ? "standings" : "groups";
S.standCache = {};
S.standCacheN = 0;
S.nameColour = function (name) {
  var n = String(name || "").trim().toLowerCase();
  if (!n) return undefined;
  if (S.colourBy === "standings" && client.loom.loom && client.loom.loom.answer) {
    var c = S.standCache[n];
    if (c === undefined) {
      c = client.loom.loom.answer("social", "person.colour", n) || null;
      if (S.standCacheN > 3000) { S.standCache = {}; S.standCacheN = 0; }
      S.standCache[n] = c; S.standCacheN++;
    }
    return c || undefined;
  }
  var g = S.look.group(n);
  return g ? S.color[g] : undefined;
};
S.look = {
  group: function (name) {
    var n = String(name || "").trim().toLowerCase();
    if (!n) return undefined;
    for (var i = 0; i < S.groups.length; i++) { if (S.lists[S.groups[i]] && S.lists[S.groups[i]][n]) return S.groups[i]; }
    return undefined;
  },
  colour: function (name) { return S.nameColour(name); }
};
// A reimport may change lists or colours: tell loom (guarded: social works
// without it).
if (client.loom.notify) client.loom.notify("social");

// LEGACY: packages that haven't had their v0.2 pass read client.hl
// (client.hl.groups, client.hl.color, client.hl[group]). Same objects, so
// changes show up there too. Removed once no package reads it.
client.hl = { groups: S.groups, color: S.color };
for (var soH = 0; soH < S.groups.length; soH++) client.hl[S.groups[soH]] = S.lists[S.groups[soH]];
