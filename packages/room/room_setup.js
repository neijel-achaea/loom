// room_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry and state for the Here tab
// (#158), a replacement for the stock Room tab fed only by GMCP:
//   R.info     the last Room.Info (name, desc, area, environment, details, exits, num)
//   R.players  name -> fullname, from Room.Players / AddPlayer / RemovePlayer
//   R.items    id -> item, from Char.Items List / Add / Remove / Update (location "room")
//   R.me       your name (Char.Name / Char.Status, kept as room_name), left off the players
//   R.raw      the last payload of each method, for ROOM DEBUG
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.room) client.loom.room = {};
// redraw: how loom redraws the Here tab when an integration's source changes (#159).
client.loom.registry.room = { version: "0.1.16", keyword: "ROOM", desc: "{{description}}", redraw: function () { run_function("room_render", [], "room"); } };
var R = client.loom.room;
if (!R.info) R.info = null;
if (!R.players) R.players = {};
if (!R.items) R.items = {};
if (!R.raw) R.raw = {};
// Your target (IRE.Target.Info: id and health), and the tar variable as last
// seen, so a change of it redraws the tab.
if (R.target === undefined) R.target = null;
if (R.lastTar === undefined) R.lastTar = "";
if (R.tarAt === undefined) R.tarAt = 0;
// The tar variable is set inside Nexus (TAR, aliases) and sends nothing to
// the game, so waiting for the next prompt to notice it made the glow lag
// (Ricardo: "less crisp than the stock tab"). Look at it a few times a
// second instead: one variable read and a compare, and a draw only when it
// changed. Replaced on every setup, so a reimport never leaves two.
if (R.tarWatch) clearInterval(R.tarWatch);
R.tarWatch = setInterval(function () {
  var tw;
  try { tw = String(get_variable("tar") || ""); } catch (e) { return; }
  if (tw === R.lastTar) return;
  R.lastTar = tw;
  R.tarAt = Date.now();
  clearTimeout(R.drawT);
  run_function("room_render", [], "room");
}, 150);
if (!R.me) { try { R.me = String(get_variable("room_name") || ""); } catch (e) { R.me = ""; } }
// The description starts folded to two lines (room_desc "folded"/"open").
R.descOpen = get_variable("room_desc") == "open";
R.tab = "Here";

// Newbies (#242): players whose full name (GMCP fullname) carries one of
// these titles get a green leaf. Here reads the title live; for tabs that
// see no titles (Online, Comms) the names are remembered (room_newbies,
// name -> when last seen with the title) and forgotten once the player is
// seen without it. Helpers rebuilt on every run, the list kept.
R.newbieTitles = ["Uaithne", "Ithin", "Tuqad"];
R.newbieTitle = function (name, full) {
  var words = String(full || "").split(/[^A-Za-z']+/);
  for (var i = 0; i < words.length; i++) { if (words[i] !== name && R.newbieTitles.indexOf(words[i]) >= 0) return words[i]; }
  return "";
};
if (!R.newbies) {
  try { R.newbies = JSON.parse(get_variable("room_newbies") || "{}") || {}; } catch (e) { R.newbies = {}; }
}
// seen(name, full): note a player seen in a room; true when the remembered
// list changed.
R.seen = function (name, full) {
  if (!name) return false;
  var k = String(name).toLowerCase();
  var t = R.newbieTitle(name, full);
  if (t) { var was = R.newbies[k] ? R.newbies[k].title : ""; R.newbies[k] = { title: t, t: Date.now() }; return was !== t; }
  if (R.newbies[k]) { delete R.newbies[k]; return true; }
  return false;
};
R.saveNewbies = function () { try { set_variable("room_newbies", JSON.stringify(R.newbies)); } catch (e) {} };
R.leaf = function (title) { return '<span title="' + String(title || "newbie").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;") + '" style="margin-left:4px;cursor:default;"><svg width="10" height="10" viewBox="0 0 10 10" style="vertical-align:-1px;" xmlns="http://www.w3.org/2000/svg"><path d="M1.2 8.8C1.2 4.2 3.8 1.2 8.8 1.2C8.8 6.2 5.8 8.8 1.2 8.8Z" fill="#8fd694"/><path d="M1.6 8.4L6.2 3.8" stroke="#2f5532" stroke-width="0.9"/></svg></span>'; };
// The read-only look other packages see through loom: never its variables.
//   look.newbie(name) -> the newbie title ("Ithin") someone was last seen
//     with, or undefined.
R.look = {
  newbie: function (name) { var e = R.newbies[String(name || "").toLowerCase()]; return e ? e.title : undefined; }
};
