// social_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, migration, lists, watchlist.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.social) client.loom.social = {};
client.loom.registry.social = { version: "0.3.1", keyword: "SOCIAL", desc: "{{description}}" };
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
S.interval = 5000;
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
if (S.lastPoll === undefined) S.lastPoll = 0;
S.buf = [];
if (!S.lastCount) S.lastCount = 0;
// A line of QW names: wrapped lines end in "," or "and", or start with "and" (#75).
S.reNames = /^(?:and\s+)?[A-Z][a-z]+(?:(?:,\s*(?:and\s+)?|\s+and\s+)[A-Z][a-z]+)*(?:,|,?\s+and|\.)?$/;
S.reFooter = /^Plus another \d+/;
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
S.timer = setInterval(function () { run_function("social_poll", [], "social"); }, S.interval);

// LEGACY: packages that haven't had their v0.2 pass read client.hl
// (client.hl.groups, client.hl.color, client.hl[group]). Same objects, so
// changes show up there too. Removed once no package reads it.
client.hl = { groups: S.groups, color: S.color };
for (var soH = 0; soH < S.groups.length; soH++) client.hl[S.groups[soH]] = S.lists[S.groups[soH]];
