// partycomms_send -- run on each Char.Vitals: works out your target, then
// broadcasts over party tell when something moved, at most once a second
// and at least every ten. Nothing goes to the game while triggers are paused
// (an unset pauseTriggers counts as off) or with broadcasting off.
//
// The message, one line, fields separated by spaces; "~" splits the vitals
// from the target ("|" would split the command in Nexus, "@" can expand as
// a variable). A class with spaces is sent with underscores.
//   [PARTY] Name Class hp/maxhp mp/maxmp ep/maxep wp/maxwp rage nl ~ tid thp target name
// tid is 0 and thp and the name are "-" when unknown.
var PC = client.loom.partycomms;
var ME = PC.me;
var pcNow = Date.now() / 1000;
var pcPaused = (get_variable("pauseTriggers") === "on");

// --- the target ---
var pcTar = String(get_variable("tar") || "").replace(/^\s+|\s+$/g, "");
var pcDig = pcTar.match(/(\d+)/);
var pcTid = pcDig ? pcDig[1] : "";
var pcTname = "";
var pcThp = "";
var TI = PC.tInfo;
if (TI.id && (pcTid === "" || TI.id === pcTid)) {
  pcTid = TI.id;
  pcTname = TI.name;
  pcThp = TI.hp;
} else if (pcTid !== "") {
  if (PC.tName.id === pcTid) {
    pcTname = PC.tName.name;
  } else if (PC.on && !pcPaused && pcNow - PC.ih.at >= 2) {
    // Not named yet: look it up with IH, whose lines are hidden as they come.
    PC.ih.on = true;
    PC.ih.at = pcNow;
    send_command("ih", 1);
  }
} else if (pcTar !== "") {
  pcTname = pcTar;
}
PC.target = { id: pcTid, name: pcTname, hp: pcThp };

// --- the broadcast ---
if (PC.on && !pcPaused && ME.name && ME.maxhp > 0) {
  var pcHpp = Math.round(ME.hp * 100 / ME.maxhp);
  var pcMpp = ME.maxmp > 0 ? Math.round(ME.mp * 100 / ME.maxmp) : 0;
  var S0 = PC.sent;
  var pcThpN = parseInt(pcThp, 10);
  var pcMoved = Math.abs(pcHpp - S0.hp) >= 5 || Math.abs(pcMpp - S0.mp) >= 5 ||
    pcTid !== S0.tid || pcTname !== S0.tname ||
    (!isNaN(pcThpN) && (S0.thp === "" || Math.abs(pcThpN - parseInt(S0.thp, 10)) >= 10)) ||
    pcNow - S0.at >= 10;
  if (pcMoved && pcNow - S0.at >= 1) {
    var pcCls = (ME.cls || "-").replace(/\s+/g, "_");
    var pcMsg = "pt [PARTY] " + ME.name + " " + pcCls +
      " " + ME.hp + "/" + ME.maxhp + " " + ME.mp + "/" + ME.maxmp +
      " " + ME.ep + "/" + ME.maxep + " " + ME.wp + "/" + ME.maxwp +
      " " + (ME.rage || 0) + " " + (ME.nl || 0) +
      " ~ " + (pcTid || "0") + " " + (pcThp !== "" ? pcThp : "-") + " " + (pcTname || "-");
    send_command(pcMsg, 1);
    PC.sent = { at: pcNow, hp: pcHpp, mp: pcMpp, tid: pcTid, tname: pcTname, thp: pcThp };
  }
}
run_function("partycomms_render", [], "partycomms");
