// comms_name, comms_cap, comms_muted and comms_saved are left intact.
// Lines still waiting for the 15-second save are saved now.
if (client.loom && client.loom.comms && client.loom.comms.saveT) {
  clearTimeout(client.loom.comms.saveT); client.loom.comms.saveT = null;
  try { run_function("comms_save", [], "comms"); } catch (e) {}
}
// Leave LOOM and the integrations at once, not at the next load (#137):
// loom takes the entry out and redraws the tabs that showed this package's answers.
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("comms");
  else delete client.loom.registry.comms;
}
