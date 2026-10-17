// partycomms_send -- run on each Char.Vitals: works out your target, then
// broadcasts over party tell when something moved, at most once a second
// and at least every ten. Nothing goes to the game while triggers are paused
// (an unset pauseTriggers counts as off) or with broadcasting off.
//
// The message, one line, fields separated by spaces; "~" splits the vitals
// from the target ("|" would split the command in Nexus, "@" can expand as
// a variable). A class with spaces is sent with underscores.
// The class carries the level after a colon when known ("Druid:91", #288),
// so copies of partycomms that predate it still match the line.
//   [PARTY] Name Class[:level] hp/maxhp mp/maxmp ep/maxep wp/maxwp rage nl ~ tid thp target name
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
}
if (pcTid !== "" && pcTname === "") {
  if (PC.tName.id === pcTid) {
    pcTname = PC.tName.name;
  } else if (PC.on && !pcPaused && PC.ih.id !== pcTid && pcNow - PC.ih.at >= 2) {
    // Not named yet: look it up with IH (once per target), whose lines are
    // hidden as they come.
    PC.ih.on = true;
    PC.ih.at = pcNow;
    PC.ih.id = pcTid;
    send_command("ih", 1);
  }
} else if (pcTid === "" && pcTar !== "") {
  pcTname = pcTar;
}
PC.target = { id: pcTid, name: pcTname, hp: pcThp };

// --- the broadcast ---
// PC.why says what's holding it back, for PARTYCOMMS.
PC.why = !PC.on ? "sharing is off (PARTYCOMMS ON)" :
  (pcPaused ? "triggers are paused (LOOM PAUSE OFF)" :
  (!ME.name ? "the game hasn't sent your name yet: log out and back in once, or PARTYCOMMS NAME <your name>" :
  (!(ME.maxhp > 0) ? "no vitals from the game yet" : "")));
if (!PC.why) {
  var pcHpp = Math.round(ME.hp * 100 / ME.maxhp);
  var pcMpp = ME.maxmp > 0 ? Math.round(ME.mp * 100 / ME.maxmp) : 0;
  var S0 = PC.sent;
  var pcThpN = parseInt(pcThp, 10);
  var pcMoved = Math.abs(pcHpp - S0.hp) >= 5 || Math.abs(pcMpp - S0.mp) >= 5 ||
    pcTid !== S0.tid || pcTname !== S0.tname ||
    (!isNaN(pcThpN) && (S0.thp === "" || Math.abs(pcThpN - parseInt(S0.thp, 10)) >= 10)) ||
    pcNow - S0.at >= 10;
  if (pcMoved && pcNow - S0.at >= 1) {
    var pcCls = (ME.cls || "-").replace(/\s+/g, "_") + (ME.lvl > 0 ? ":" + ME.lvl : "");
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
