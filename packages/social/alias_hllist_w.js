var g = args[1].toLowerCase();
if (!client.hl || !client.hl[g]) { display_notice("[hl] no group: " + g); }
else {
  var names = Object.keys(client.hl[g]).sort();
  display_notice("[hl] " + g + " (" + names.length + "): " + (names.length ? names.join(", ") : "empty"));
}