// A CWHO row, e.g. "*Ithin Mealla, of Eleusis 1 On Sylvan" or "Sapling
// Kryssla, Tuqad of the Aureliana 1 On Druid" (#242): the name is the last
// word before the comma (titles come first), the newbie title may be on
// either side. Remembered as a newbie with one, forgotten without one.
// Only right after CWHO's header.
var R = client.loom && client.loom.room;
if (R && R.cwhoAt && Date.now() - R.cwhoAt < 2000) {
  var cwFull = String(args[1]).replace(/^\*/, "").trim();
  var cwWords = cwFull.split(",")[0].trim().split(/\s+/);
  var cwName = cwWords[cwWords.length - 1];
  if (/^[A-Z][a-z]+$/.test(cwName) && R.seen(cwName, cwFull)) {
    R.saveNewbies();
    if (client.loom.notify) client.loom.notify("room");
    run_function("room_render", [], "room");
  }
}
