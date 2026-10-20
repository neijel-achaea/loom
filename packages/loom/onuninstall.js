// Uninstalling loom ends a LOOM PERF sample, so nothing stays wrapped.
if (client.__loomPerfRestore) { try { client.__loomPerfRestore(); } catch (e) {} client.__loomPerfRestore = null; }
if (client.loom && client.loom.loom) client.loom.loom.perfState = null;
