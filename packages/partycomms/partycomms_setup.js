// partycomms_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration of the
// party_* variables, then the state, each part built if missing.
// Saved: partycomms_on, and the last name, class and level the game sent.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.partycomms) client.loom.partycomms = {};
client.loom.registry.partycomms = { version: "0.2.6", keyword: "PARTYCOMMS", desc: "{{description}}",
  // Redrawn by loom when the tab theme changes (#310).
  redraw: function () { if (client.loom.partycomms) client.loom.partycomms.lastRender = 0; run_function("partycomms_render", [], "partycomms"); } };
var PC = client.loom.partycomms;

// One-time migration. party_on becomes partycomms_on; the rest were working
// state kept in variables (now in memory), so they are deleted.
var pcOn;
try { pcOn = get_variable("party_on"); } catch (e) { pcOn = undefined; }
if (pcOn !== undefined && pcOn !== null) {
  var pcHave;
  try { pcHave = get_variable("partycomms_on"); } catch (e) { pcHave = undefined; }
  if (pcHave === undefined || pcHave === null || ("" + pcHave) === "") set_variable("partycomms_on", ("" + pcOn) === "0" ? "0" : "1");
}
// party_me (the old PARTYNAME) becomes the remembered name until the game
// sends its own.
var pcMe;
try { pcMe = get_variable("party_me"); } catch (e) { pcMe = undefined; }
if (pcMe && ("" + pcMe) !== "undefined") {
  var pcHaveName;
  try { pcHaveName = get_variable("partycomms_name"); } catch (e) { pcHaveName = undefined; }
  if (!pcHaveName) set_variable("partycomms_name", "" + pcMe);
}
var pcGone = ["party_on", "party_me", "party_data", "party_last_send", "party_last_sent", "party_last_render", "party_ih", "party_ih_at", "party_ih_tail", "tarname", "tarname_for"];
for (var pcI = 0; pcI < pcGone.length; pcI++) {
  var pcV;
  try { pcV = get_variable(pcGone[pcI]); } catch (e) { pcV = undefined; }
  if (pcV !== undefined && pcV !== null) delete_variable(pcGone[pcI]);
}

// Broadcasting is on unless switched off.
if (PC.on === undefined) {
  var pcSaved;
  try { pcSaved = get_variable("partycomms_on"); } catch (e) { pcSaved = undefined; }
  PC.on = !(("" + pcSaved) === "0");
}
// Who you are and how you're doing, from GMCP.
// The game sends your name and class only at login and when they change, so
// the last ones seen are kept (partycomms_name, partycomms_class): a reload
// that doesn't log in again still knows who you are.
if (!PC.me) {
  var pcName, pcCls;
  try { pcName = get_variable("partycomms_name"); } catch (e) { pcName = ""; }
  try { pcCls = get_variable("partycomms_class"); } catch (e) { pcCls = ""; }
  PC.me = { name: (pcName && ("" + pcName) !== "undefined") ? "" + pcName : "", cls: (pcCls && ("" + pcCls) !== "undefined") ? "" + pcCls : "", hp: 0, maxhp: 0, mp: 0, maxmp: 0, ep: 0, maxep: 0, wp: 0, maxwp: 0, rage: 0, nl: 0 };
}
// The level, kept like the name and class (#288): the game sends it at login.
// Helpers are rebuilt every run; only the data is kept.
if (PC.me.lvl === undefined) {
  var pcLvl;
  try { pcLvl = parseInt(get_variable("partycomms_level"), 10); } catch (e) { pcLvl = 0; }
  PC.me.lvl = pcLvl > 0 ? pcLvl : 0;
}
PC.setLevel = function (n) {
  if (n > 0 && n !== PC.me.lvl) { PC.me.lvl = n; set_variable("partycomms_level", String(n)); }
};
// The target: IRE.Target.Info when the game sends it, the tar variable and
// an IH lookup otherwise.
if (!PC.tInfo) PC.tInfo = { id: "", name: "", hp: "" };
if (!PC.tName) PC.tName = { id: "", name: "" };
if (!PC.ih) PC.ih = { on: false, at: 0, tail: 0, id: "" };
// Party members heard from, by name: their last report and when it came.
if (!PC.members) PC.members = {};
if (!PC.sent) PC.sent = { at: 0, hp: -1, mp: -1, tid: "", tname: "", thp: "" };
if (PC.lastRender === undefined) PC.lastRender = 0;
// The read-only look other packages see through loom (#256).
//   look.targeting(id) -> names of the party members (you left out) whose
//     latest report, under PC.lookMs old, has the mob numbered id as target.
PC.lookMs = 30000;
PC.look = {
  targeting: function (id) {
    var out = [], want = String(id || ""), now = Date.now() / 1000;
    if (!want) return out;
    for (var n in PC.members) {
      if (!PC.members.hasOwnProperty(n) || n === PC.me.name) continue;
      var m = PC.members[n];
      if (m && String(m.tid) === want && now - m.t <= PC.lookMs / 1000) out.push(n);
    }
    return out.sort();
  }
};
