var viSoc = client.loom.social && client.loom.social.look;
display_notice("[vision] " + String(get_variable("vision_on")).toUpperCase()
  + ": hide city members " + String(get_variable("vision_hide")).toUpperCase()
  + ", enemy alerts " + String(get_variable("vision_alert")).toUpperCase() + " on " + String(get_variable("vision_channel")).toUpperCase()
  + (viSoc ? "" : " (social isn't installed: nobody is recognised)") + ". VISION HELP for commands.", "cyan");
