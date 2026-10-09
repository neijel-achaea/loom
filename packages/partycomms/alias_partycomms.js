// PARTYCOMMS [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.partycomms || !client.loom.partycomms.members) run_function("partycomms_setup", [], "partycomms");
var PC = client.loom.partycomms;
var pcW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var pcSub = pcW[0];
function pcSay(t, c) { display_notice("[partycomms] " + t, c || "cyan"); }
function pcRedraw() { PC.lastRender = 0; run_function("partycomms_render", [], "partycomms"); }

if (pcSub === "" || pcSub === "status") {
  var ME = PC.me;
  pcSay((PC.on ? "sharing your vitals and target over party tell" : "not sharing (PARTYCOMMS ON to start)") + (ME.name ? ", as " + ME.name + (ME.cls ? " (" + ME.cls + ")" : "") : ", once the game sends your name") + ".");
  var T = PC.target || {};
  pcSay("your target: " + (T.id || T.name ? (T.name || "?") + (T.id ? " #" + T.id : "") + (T.hp ? " " + T.hp + "%" : "") : "none") + ".");
  var now = Date.now() / 1000;
  var heard = [];
  for (var nm in PC.members) {
    if (PC.members.hasOwnProperty(nm)) {
      var p = PC.members[nm];
      var hpp = p.maxhp > 0 ? Math.round(p.hp * 100 / p.maxhp) : 0;
      heard.push(nm + " " + hpp + "%" + (p.tname ? " -> " + p.tname : "") + (now - p.t > 12 ? " (link lost " + Math.round(now - p.t) + "s)" : ""));
    }
  }
  pcSay(heard.length ? "heard from: " + heard.join("; ") + "." : "no reports from the party yet.");
} else if (pcSub === "help") {
  run_function("partycomms_help", [], "partycomms");
} else if (pcSub === "on" || pcSub === "off") {
  PC.on = (pcSub === "on");
  set_variable("partycomms_on", PC.on ? "1" : "0");
  PC.sent.at = 0;
  pcSay(PC.on ? "sharing on; your first report goes out with the next prompt." : "sharing off.", PC.on ? "cyan" : "orange");
  pcRedraw();
} else if (pcSub === "clear") {
  PC.members = {};
  pcSay("party reports cleared.", "orange");
  pcRedraw();
} else if (pcSub === "test") {
  // Two sample members, so the tab can be checked solo.
  var tNow = Date.now() / 1000;
  PC.members["Testalpha"] = { cls: "Druid", hp: 3200, maxhp: 4784, mp: 4646, maxmp: 5096, ep: 18000, maxep: 21685, wp: 18870, maxwp: 23170, rage: 24, nl: 28.12, tid: (PC.target && PC.target.id) || "12345", thp: "62", tname: "a plague rat", t: tNow };
  PC.members["Testbeta"] = { cls: "Black Dragon", hp: 900, maxhp: 4100, mp: 2000, maxmp: 4800, ep: 9000, maxep: 20000, wp: 11000, maxwp: 21000, rage: 41, nl: 92.4, tid: "", thp: "", tname: "", t: tNow - 30 };
  pcSay("two sample members added; PARTYCOMMS CLEAR removes them.");
  pcRedraw();
} else if (pcSub === "debug") {
  pcSay("on=" + PC.on + " pause=" + (get_variable("pauseTriggers") || "unset") + " me=" + JSON.stringify(PC.me), "orange");
  pcSay("tar=" + get_variable("tar") + " target=" + JSON.stringify(PC.target) + " tInfo=" + JSON.stringify(PC.tInfo) + " tName=" + JSON.stringify(PC.tName) + " ih=" + JSON.stringify(PC.ih), "orange");
  pcSay("sent=" + JSON.stringify(PC.sent) + " members=" + Object.keys(PC.members).join(","), "orange");
} else {
  pcSay("unknown command '" + pcSub + "'. PARTYCOMMS HELP for commands.", "orange");
}
