// chronicle_gmcp -- the work behind onGMCP, as a function made once per load
// (client.loom.hooks.chronicle.gmcp): onGMCP runs on every message, so the
// script itself stays short (#136). Run from onLoad and onInstall.
if (!client.loom) client.loom = {};
if (!client.loom.hooks) client.loom.hooks = {};
if (!client.loom.hooks.chronicle) client.loom.hooks.chronicle = {};
client.loom.hooks.chronicle.gmcp = function (args) {
  var m = args && args.gmcp_method;
  if (m !== "Char.Vitals" && m !== "Room.Info" && m !== "Comm.Channel.Text" && m !== "Room.Players" && m !== "Room.AddPlayer" &&
      m !== "Room.RemovePlayer" && m !== "Comm.Channel.List" && m !== "Char.Name" && m !== "Char.Status") return;
  if (!client.loom.chronicle || !client.loom.chronicle.line) run_function("chronicle_setup", [], "chronicle");
  var CR = client.loom.chronicle;
  var raw = args.gmcp_args;
  if (typeof raw == "string" && m !== "Room.RemovePlayer") { try { raw = JSON.parse(raw); } catch (e) { raw = null; } }
  var g = (raw && typeof raw == "object") ? raw : {};
  if (m === "Char.Vitals") {
    if (g.hp !== undefined && g.mp !== undefined) CR.vitHM = [String(g.hp).replace(/\D/g, ""), String(g.mp).replace(/\D/g, "")];
    CR.tick();
  } else if (m === "Room.Info") {
    CR.enter(g);
  } else if (m === "Comm.Channel.Text") {
    CR.chan(g);
  } else if (m === "Room.Players") {
    CR.players = {};
    if (Array.isArray(raw)) { for (var i = 0; i < raw.length; i++) { if (raw[i] && raw[i].name) CR.meet(raw[i].name); } }
  } else if (m === "Room.AddPlayer") {
    if (g.name) CR.meet(g.name);
  } else if (m === "Room.RemovePlayer") {
    var gone = String(typeof raw == "string" ? raw : (g.name || "")).replace(/^"|"$/g, "").toLowerCase();
    if (gone) delete CR.players[gone];
  } else if (m === "Comm.Channel.List") {
    if (Array.isArray(raw)) { for (var j = 0; j < raw.length; j++) { if (raw[j] && raw[j].name && raw[j].caption) CR.captions[String(raw[j].name)] = String(raw[j].caption); } }
  } else if (g.name) {
    if (CR.status) CR.status(g);
    var n = String(g.name).split(/\s+/)[0];
    if (n && n !== CR.me) { CR.me = n; set_variable("chronicle_name", n); }
  }
};
