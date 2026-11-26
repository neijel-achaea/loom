// The ripples_* variables are left intact; a run under way stays saved.
if (client.loom && client.loom.ripples) {
  var ruR = client.loom.ripples;
  if (ruR.drawT) clearTimeout(ruR.drawT);
  ruR.cap = null; ruR.ccap = null; ruR.scr = null;
}
// Leave LOOM and the integrations at once, not at the next load (#137).
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("ripples");
  else delete client.loom.registry.ripples;
}
