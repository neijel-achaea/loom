if (client.fshLearn) {
  if (!client.fshBuf) { client.fshBuf = []; }
  // args[0] is only the matched text, so the whole line is captured
  // explicitly with a group rather than relying on a bare wildcard.
  var raw = args[1] || args[0] || "";
  if (raw.length > 0 && raw.length < 300) {
    client.fshBuf.push(raw);
    while (client.fshBuf.length > 120) { client.fshBuf.shift(); }
  }
}