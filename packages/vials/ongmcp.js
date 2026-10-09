// Sets the package up on the first GMCP message after an import (Nexus
// doesn't run onInstall when importing over an existing package).
if (!client.loom || !client.loom.vials || !client.loom.vials.map) run_function("vials_setup", [], "vials");
