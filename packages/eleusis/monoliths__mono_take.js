// mono_take -- pops the oldest queued room into mono_head (or null).
// Entries older than 15s are dropped: their reply was lost somewhere.
var q = get_variable("mono_queue") || [];
var now = Date.now();
var head = null;
while (q.length > 0 && head === null) {
  var e = q.shift();
  if (now - e.t < 15000) head = e;
}
set_variable("mono_queue", q);
set_variable("mono_head", head);
