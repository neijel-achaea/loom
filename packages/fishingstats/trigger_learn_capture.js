// Runs on every line, so it does nothing unless LEARN is on.
if (client.loom && client.loom.fishingstats && client.loom.fishingstats.learn) {
  var FS = client.loom.fishingstats;
  if (!FS.buf) { FS.buf = []; }
  // args[0] is only the matched text, so the whole line is captured
  // explicitly with a group rather than relying on a bare wildcard.
  var raw = args[1] || args[0] || "";
  if (raw.length > 0 && raw.length < 300) {
    FS.buf.push(raw);
    while (FS.buf.length > 120) { FS.buf.shift(); }
  }
}