run_function("lg_build", [], "ledger");
var raw = args[1];
var at = raw.indexOf(" @ ");
var txt = raw;
var tail = "";
if (at >= 0) {
  txt = raw.substring(0, at).trim();
  tail = raw.substring(at + 3).trim().toLowerCase();
}
var today = client.lg.day;
var due = null;
var rep = null;
var bad = "";

if (!txt.length) {
  bad = "no text given";
} else if (tail.length && today === 0) {
  bad = "date not known yet - run LEDGER DATE first";
} else if (tail.length) {
  var mRel = tail.match(/^\+(\d+)\s+(day|days|month|months)(\s+repeat)?$/);
  var mFix = tail.match(/^(\d+)\s+([a-z]+)\s+(\d+)(\s+repeat)?$/);
  if (mRel) {
    var nn = parseInt(mRel[1], 10);
    var step = (mRel[2].charAt(0) == "m") ? nn * 25 : nn;
    due = today + step;
    if (mRel[3]) { rep = { t: "i", n: step }; }
  } else if (mFix) {
    var fd = parseInt(mFix[1], 10);
    var fy = parseInt(mFix[3], 10);
    var fi = -1;
    var k;
    for (k = 0; k < client.lg.months.length; k++) {
      if (client.lg.months[k].toLowerCase() == mFix[2]) { fi = k; }
    }
    if (fi < 0) { bad = "unknown month: " + mFix[2]; }
    else if (fd < 1 || fd > 25) { bad = "day must be 1-25"; }
    else {
      due = fy * 300 + fi * 25 + fd;
      if (mFix[4]) { rep = { t: "a", m: fi, d: fd }; }
    }
  } else {
    bad = "cannot read '" + tail + "' - use '15 Miraman 1015' or '+4 months', optionally + ' repeat'";
  }
  if (!bad.length && due < today) { bad = "that date is already behind you - nothing added"; }
}

if (bad.length) {
  display_notice("[ledger] " + bad, "#ff5f5f");
} else {
  var items = [];
  try { items = JSON.parse(get_variable("lg_items")) || []; } catch (e) { items = []; }
  var seq = parseInt(get_variable("lg_seq") || "0", 10) + 1;
  var rec = {};
  rec.id = seq;
  rec.text = txt;
  rec.source = "manual";
  rec.status = "open";
  rec.created = today;
  rec.touched = today;
  rec.due = due;
  rec.repeat = rep;
  rec.tag = null;
  rec.link = null;
  rec.notified = false;
  items.push(rec);
  set_variable("lg_items", JSON.stringify(items));
  set_variable("lg_seq", "" + seq);
  display_notice("[ledger] #" + seq + " added" + (due ? "" : " (standing)"), "#8fe0c8");
  run_function("lg_check", [], "ledger");
}
