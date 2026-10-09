// partycomms_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration of the
// party_* variables, then the state, each part built if missing.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.partycomms) client.loom.partycomms = {};
client.loom.registry.partycomms = { version: "0.2.0", keyword: "PARTYCOMMS" };
var PC = client.loom.partycomms;

// One-time migration. party_on becomes partycomms_on; the rest were working
// state kept in variables (now in memory) or the broadcast name (now the
// game's), so they are deleted.
var pcOn;
try { pcOn = get_variable("party_on"); } catch (e) { pcOn = undefined; }
if (pcOn !== undefined && pcOn !== null) {
  var pcHave;
  try { pcHave = get_variable("partycomms_on"); } catch (e) { pcHave = undefined; }
  if (pcHave === undefined || pcHave === null || ("" + pcHave) === "") set_variable("partycomms_on", ("" + pcOn) === "0" ? "0" : "1");
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
if (!PC.me) PC.me = { name: "", cls: "", hp: 0, maxhp: 0, mp: 0, maxmp: 0, ep: 0, maxep: 0, wp: 0, maxwp: 0, rage: 0, nl: 0 };
// The target: IRE.Target.Info when the game sends it, the tar variable and
// an IH lookup otherwise.
if (!PC.tInfo) PC.tInfo = { id: "", name: "", hp: "" };
if (!PC.tName) PC.tName = { id: "", name: "" };
if (!PC.ih) PC.ih = { on: false, at: 0, tail: 0 };
// Party members heard from, by name: their last report and when it came.
if (!PC.members) PC.members = {};
if (!PC.sent) PC.sent = { at: 0, hp: -1, mp: -1, tid: "", tname: "", thp: "" };
if (PC.lastRender === undefined) PC.lastRender = 0;
