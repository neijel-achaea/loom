// partycomms_on is left intact; a held-back broadcast is dropped.
if (client.loom && client.loom.partycomms && client.loom.partycomms.trailT) { clearTimeout(client.loom.partycomms.trailT); client.loom.partycomms.trailT = null; }
// Leave LOOM and the integrations at once, not at the next load (#137):
// loom takes the entry out and redraws the tabs that showed this package's answers.
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("partycomms");
  else delete client.loom.registry.partycomms;
}
