// Uninstalling loom ends a LOOM PERF sample, so nothing stays wrapped.
if (client.__loomPerfRestore) { try { client.__loomPerfRestore(); } catch (e) {} client.__loomPerfRestore = null; }
if (client.loom && client.loom.loom) client.loom.loom.perfState = null;
// Leave at once, not at the next load (#137): with loom's entry gone every
// link waits, so the tabs are redrawn without integrations or a theme.
if (client.loom && client.loom.registry) {
  delete client.loom.registry.loom;
  client.loom.theme = null;
  var lmL = client.loom.loom;
  var lmReg = client.loom.registry;
  for (var lmP in lmReg) {
    if (lmReg[lmP] && typeof lmReg[lmP].redraw == "function") {
      if (lmL && typeof lmL.redraw == "function") lmL.redraw(lmP);
      else { try { lmReg[lmP].redraw(); } catch (e) {} }
    }
  }
}
