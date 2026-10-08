var CR = client.loom.crystalism;
if (CR.state === "ir" || CR.state === "touch") {
  CR.abortWhy = "no answer from the game while waiting for " + (CR.state === "ir" ? "the rift listing" : "the facet count");
  run_function("crystalism_abort", [], "crystalism");
}
