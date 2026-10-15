// comms_save -- keeps the latest lines in comms_saved, so a reload starts with
// them: at most 40 per channel and 300 in all, the newest. Run 15s after a new
// line (once per burst) and by COMMS CLEAR.
var C = client.loom.comms;
var svAll = [];
for (var svK in C.chans) {
  if (!C.chans.hasOwnProperty(svK)) continue;
  var svL = C.chans[svK].lines;
  for (var svI = Math.max(0, svL.length - 40); svI < svL.length; svI++) svAll.push(svL[svI]);
}
svAll.sort(function (a, b) { return a.s - b.s; });
if (svAll.length > 300) svAll = svAll.slice(svAll.length - 300);
var svOut = [];
for (var svJ = 0; svJ < svAll.length; svJ++) {
  var svX = svAll[svJ];
  svOut.push({ t: svX.t, ch: svX.ch, conv: svX.conv, talker: svX.talker, segs: svX.segs, me: svX.me, mention: svX.mention });
}
try { set_variable("comms_saved", JSON.stringify({ short: C.short, lines: svOut })); } catch (e) {}
