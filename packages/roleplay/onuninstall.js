// Stop the ambient emotes; the roleplay_* variables are left intact.
if (client.loom && client.loom.roleplay && client.loom.roleplay.aem) { try { clearTimeout(client.loom.roleplay.aem.timer); } catch (e) {} client.loom.roleplay.aem = null; }
