// sigils_take -- pops the oldest queued room into S.head (or null).
// Entries older than 15s are dropped: their reply was lost somewhere.
var S = client.loom.sigils;
var q = S.queue || [];
var now = Date.now();
var head = null;
while (q.length > 0 && head === null) {
  var e = q.shift();
  if (now - e.t < 15000) head = e;
}
S.queue = q;
S.head = head;
