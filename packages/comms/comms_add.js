// comms_add -- args: one Comm.Channel.Text payload {channel, talker, text}.
// Turns the game's line into a stored line for the Comms tab:
//   {s, t, ch, conv, talker, segs: [[text, colour]...], me, mention}
// The ANSI colours become segments in the game's own colours (so your CONFIG
// COLOUR choices carry over), and the "(Party): " style prefix is dropped (the
// tab shows the channel itself), learning the channel's name from it.
// Tells ("tell Dol") are all kept under "tells", by person.
var C = client.loom.comms;
var caCh = String(args.channel || "");
var caTalker = String(args.talker || "");
var caRaw = String(args.text || "");

// ANSI -> segments. Bold (1) or the 90s give the bright shade.
var caPal = {
  n: { 30: "#6d6d6d", 31: "#d0504a", 32: "#3fae4a", 33: "#c8a63a", 34: "#5a78d8", 35: "#b45ab4", 36: "#3fb2b2", 37: "#c8c8c8" },
  b: { 30: "#9a9a9a", 31: "#ff6b62", 32: "#6fe07a", 33: "#f2e15e", 34: "#7d9cff", 35: "#f07af0", 36: "#62e6e6", 37: "#f4f4f4" }
};
var caSegs = [];
var caBold = false, caFg = null;
var caParts = caRaw.split(/\u001b\[([0-9;]*)m/);
for (var caI = 0; caI < caParts.length; caI++) {
  if (caI % 2 === 1) {
    var caCodes = caParts[caI] === "" ? ["0"] : caParts[caI].split(";");
    for (var caJ = 0; caJ < caCodes.length; caJ++) {
      var caC = parseInt(caCodes[caJ], 10);
      if (caC === 0) { caBold = false; caFg = null; }
      else if (caC === 1) caBold = true;
      else if (caC === 22) caBold = false;
      else if (caC >= 30 && caC <= 37) caFg = { c: caC, br: false };
      else if (caC >= 90 && caC <= 97) caFg = { c: caC - 60, br: true };
      else if (caC === 39) caFg = null;
    }
  } else if (caParts[caI] !== "") {
    var caCol = caFg ? caPal[(caBold || caFg.br) ? "b" : "n"][caFg.c] : "";
    var caLast = caSegs[caSegs.length - 1];
    if (caLast && caLast[1] === caCol) caLast[0] += caParts[caI];
    else caSegs.push([caParts[caI], caCol]);
  }
}
// Any stray control characters left out; trailing spaces trimmed.
for (var caK = 0; caK < caSegs.length; caK++) caSegs[caK][0] = caSegs[caK][0].replace(/[\u0000-\u001f]/g, "");
if (caSegs.length) caSegs[caSegs.length - 1][0] = caSegs[caSegs.length - 1][0].replace(/\s+$/, "");

// "(Party): " / "(Eleusis): " -> dropped, and remembered as the channel's short name.
var caPlain = "";
for (var caP = 0; caP < caSegs.length; caP++) caPlain += caSegs[caP][0];
var caPre = /^\(([^)]{1,40})\):\s+/.exec(caPlain);
if (caPre) {
  C.short[caCh] = caPre[1];
  var caDrop = caPre[0].length;
  while (caDrop > 0 && caSegs.length) {
    if (caSegs[0][0].length <= caDrop) { caDrop -= caSegs[0][0].length; caSegs.shift(); }
    else { caSegs[0][0] = caSegs[0][0].slice(caDrop); caDrop = 0; }
  }
}

var caKey = caCh;
var caConv = null;
var caTell = /^tell\s+(\S+)/i.exec(caCh);
if (caTell) { caKey = "tells"; caConv = caTell[1].charAt(0).toUpperCase() + caTell[1].slice(1).toLowerCase(); }

var caMeN = String(C.me || "").toLowerCase();
var caMe = (caMeN && caTalker.toLowerCase() === caMeN) || /^You\b/.test(caPlain.replace(/^\([^)]*\):\s+/, ""));
var caMention = !caMe && caMeN.length > 1 && new RegExp("\\b" + caMeN + "\\b", "i").test(caPlain);

var caNow = Date.now();
var caLine = { s: ++C.seq, t: caNow, ch: caKey, conv: caConv, talker: caTalker, segs: caSegs, me: caMe, mention: caMention };
if (!C.chans[caKey]) C.chans[caKey] = { key: caKey, lines: [], unread: 0, first: C.seq };
var caChan = C.chans[caKey];
caChan.lines.push(caLine);
while (caChan.lines.length > C.cap) caChan.lines.shift();
if (caConv) {
  var caCk = caConv.toLowerCase();
  if (!C.convs[caCk]) C.convs[caCk] = { name: caConv, unread: 0, last: 0 };
  C.convs[caCk].last = caNow;
}

// Unread: a line from someone else that the tab isn't showing right now.
// Muted channels count nothing.
var caSeen = (C.view === "all" && !C.muted[caKey]) || C.view === caKey || (caConv && C.view === "tell:" + caConv.toLowerCase());
if (!caMe && !caSeen && !C.muted[caKey]) {
  if (caConv) C.convs[caConv.toLowerCase()].unread++;
  else caChan.unread++;
}

// Saved a little later, so a busy channel writes once rather than per line.
if (!C.saveT) C.saveT = setTimeout(function () { client.loom.comms.saveT = null; run_function("comms_save", [], "comms"); }, 15000);
if (C.drawT) clearTimeout(C.drawT);
C.drawT = setTimeout(function () { client.loom.comms.drawT = null; run_function("comms_render", [], "comms"); }, 30);
