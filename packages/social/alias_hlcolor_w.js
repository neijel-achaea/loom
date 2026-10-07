var g = args[1].toLowerCase();
if (!client.hl || !client.hl.color[g]) { display_notice("[hl] no group: " + g); }
else {
  client.hl.color[g] = client.hl.defColor[g];
  set_variable("hlColor_" + g, "");
  display_notice("[hl] " + g + " colour reset to default " + client.hl.defColor[g]);
}