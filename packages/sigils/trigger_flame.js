var S = client.loom.sigils;
if (S && S.await) {
  S.parseIn = args[1];
  run_function("sigils_parse", [], "sigils");
  S.await.flame = S.parseOut;
  run_function("sigils_settle", [], "sigils");
}
