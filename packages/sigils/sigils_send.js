// sigils_send -- sends the probe for the room in S.pending, when it's this
// package's turn. Run on entering a room and on every prompt.
//
// The game answers in order, and the answers carry no room: an answer is
// matched to the oldest probe sent. Another package's probe still out when
// sigils sent its own (Here's silent loyal probe, sent just before you walked
// on) was answered first, with "What do you wish to examine?" (the mob was
// left behind): sigils took it for this room, "no monolith", and the real
// answer came after with nothing waiting for it. So sigils waits, as Here
// does, while any other package says an answer to it is still coming
// (registry busy(), #318), and sends at the next prompt. A probe still
// waiting when you leave the room is dropped: sent later it would read the
// next room.
var S = client.loom.sigils;
var pd = S.pending;
if (pd) {
  var here = S.room || {};
  if ((!get_variable("sigils_on") && !pd.check) || get_variable("pauseTriggers") == "on" || String(here.id) !== pd.id) {
    S.pending = null;
  } else {
    var reg = client.loom.registry || {}, wait = [];
    for (var k in reg) {
      if (!reg.hasOwnProperty(k) || k === "sigils" || !reg[k] || typeof reg[k].busy !== "function") continue;
      var b = false;
      try { b = reg[k].busy(); } catch (e) { b = false; }
      if (b) wait.push(k);
    }
    S.waitOn = wait;
    if (!wait.length) {
      S.pending = null;
      if (!S.queue) S.queue = [];
      S.queue.push({ id: pd.id, name: pd.name, t: Date.now() });
      if (S.queue.length > 20) S.queue = S.queue.slice(S.queue.length - 20);
      send_command("probe monolith here");
    }
  }
}
