var g = args[1].toLowerCase(), c = args[2];
if (!client.hl || !client.hl.color[g]) { display_notice("[hl] no group: " + g); }
else {
  client.hl.color[g] = c;
  set_variable("hlColor_" + g, c);
  display_notice("[hl] " + g + " colour set to " + c);
}