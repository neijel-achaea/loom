// A party member's report (yours included, as the game echoes it): stored
// by name and hidden. See partycomms_send for the format.
if (!client.loom || !client.loom.partycomms || !client.loom.partycomms.members) run_function("partycomms_setup", [], "partycomms");
var PC = client.loom.partycomms;
var pcCl = String(args[2]).split(":");
var pcE = {
  cls: pcCl[0].replace(/_/g, " "),
  lvl: pcCl.length > 1 ? parseInt(pcCl[1], 10) || 0 : 0,
  hp: parseInt(args[3], 10), maxhp: parseInt(args[4], 10),
  mp: parseInt(args[5], 10), maxmp: parseInt(args[6], 10),
  ep: parseInt(args[7], 10), maxep: parseInt(args[8], 10),
  wp: parseInt(args[9], 10), maxwp: parseInt(args[10], 10),
  rage: parseInt(args[11], 10), nl: parseFloat(args[12]),
  tid: args[13] === "0" ? "" : args[13],
  thp: args[14] === "-" ? "" : args[14],
  tname: String(args[15]).replace(/["'.\s]+$/, ""),
  t: Date.now() / 1000
};
if (pcE.cls === "-") pcE.cls = "";
if (pcE.tname === "-") pcE.tname = "";
PC.members[args[1]] = pcE;
gag_current_line();
PC.lastRender = 0;
run_function("partycomms_render", [], "partycomms");
