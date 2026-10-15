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
client.loom.registry.room = { version: "0.1.7", keyword: "ROOM", desc: "{{description}}", redraw: function () { run_function("room_render", [], "room"); } };
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
if (!R.me) { try { R.me = String(get_variable("room_name") || ""); } catch (e) { R.me = ""; } }
// The description starts folded to two lines (room_desc "folded"/"open").
R.descOpen = get_variable("room_desc") == "open";
R.tab = "Here";
