var MG = client.loom.magi;
if (MG.state === "ir" || MG.state === "touch") {
  MG.abortWhy = "no answer from the game while waiting for " + (MG.state === "ir" ? "the rift listing" : "the facet count");
  run_function("magi_abort", [], "magi");
}
