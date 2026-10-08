var S = client.loom.sigils;
if (S && S.queue && S.queue.length > 0) {
  run_function("sigils_settle", [], "sigils");
  run_function("sigils_take", [], "sigils");
  var head = S.head;
  if (head) {
    S.flag = { id: head.id, name: head.name, months: -1, flame: -1 };
    run_function("sigils_flag", [], "sigils");
  }
}
