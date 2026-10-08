var S = client.loom.sigils;
if (S && S.queue && S.queue.length > 0) {
  run_function("sigils_settle", [], "sigils");
  run_function("sigils_take", [], "sigils");
  var head = S.head;
  if (head) {
    S.parseIn = args[1];
    run_function("sigils_parse", [], "sigils");
    head.months = S.parseOut;
    // Wait for a possible flame line before deciding.
    S.await = head;
  }
}
