var debug = get_variable("debug");
var dragonMode = "";
var dragonAttack = "";

// Reset highlights
for (let i = 0; i < 12; i++) {
  buttons_set_highlight(i, 0);  
}

// Sets buttons depending on class
// Class comes from hunting's own onGMCP; the shared variable is the fallback
// until a Char.Status message has arrived this session.
var activeClass = (client.loom && client.loom.hunting && client.loom.hunting.cls) || get_variable("activeClass");
var slots = {};
if (debug == "on") display_notice("[debug][hunting][set_buttons] activeClass: " + activeClass, "cyan");

switch (activeClass) {
  case "Druid":
    // F1
    buttons_set_label(1, "Maul");
    buttons_set_commands(1, "queue add b!wu!t!p wreathe | queue add b!wu!t!p maul @tar");
    
    // F2
    buttons_set_label(2, "Strangle");
    buttons_set_commands(2, "queue add !wu!t!p strangle @tar");
    slots["Strangle"] = 2;

    // F3
    buttons_set_label(3, "Ravage");
    buttons_set_commands(3, "queue add !wu!t!p ravage @tar");
    slots["Ravage"] = 3;

    // F4
    buttons_set_label(4, "Vinecrack");
    buttons_set_commands(4, "queue add !wu!t!p vinecrack @tar");
    slots["Vinecrack"] = 4;

    // F5
    buttons_set_label(5, "Glare");
    buttons_set_commands(5, "queue add !wu!t!p quarterstaff glare @tar");
    slots["Glare"] = 5;

    // F6
    buttons_set_label(6, "Sting");
    buttons_set_commands(6, "queue add b!wu!t sting @tar");

    // F7
    buttons_set_label(7, "Remedy");
    buttons_set_commands(7, "evoke remedy oceana");

    // F8
    buttons_set_label(8, "Douse");
    buttons_set_commands(8, "freeze ground");

    // F9
    buttons_set_label(9, "Stats");
    buttons_set_commands(9, "huntstats");

    // F10
    buttons_set_label(10, "Diag");
    buttons_set_commands(10, "diagnose");

    // F11
    buttons_set_label(11, "Barrier");
    buttons_set_commands(11, "evoke barrier");

    // F12
    buttons_set_label(12, "Shield");
    buttons_set_commands(12, "touch shield");

    break;

  case "Magi":
    var staffAttack = get_variable("staffAttack");
    // F1
    buttons_set_label(1, "Staff");
    buttons_set_commands(1, "queue add e!wu!t!p staff cast " + staffAttack + " at @tar");
    
    // F2
    buttons_set_label(2, "Windlash");
    buttons_set_commands(2, "queue add !wu!t!p cast windlash at @tar");
    slots["Windlash"] = 2;

    // F3
    buttons_set_label(3, "Squeeze");
    buttons_set_commands(3, "queue add !wu!t!p cast squeeze @tar");
    slots["Squeeze"] = 3;

    // F4
    buttons_set_label(4, "Disintegrate");
    buttons_set_commands(4, "queue add !wu!t!p cast disintegrate at @tar");
    slots["Disintegrate"] = 4;

    // F5
    buttons_set_label(5, "Firefall");
    buttons_set_commands(5, "queue add !wu!t!p cast firefall at @tar");
    slots["Firefall"] = 5;

    // F6
    buttons_set_label(6, "Stormbolt");
    buttons_set_commands(6, "queue add !wu!t!p cast stormbolt at @tar");
    slots["Stormbolt"] = 6;

    // F7
    buttons_set_label(7, "Dilation");
    buttons_set_commands(7, "queue add !wu!t!p cast dilation at @tar");
    slots["Dilation"] = 7;

    // F8
    buttons_set_label(8, "Flood");
    buttons_set_commands(8, "queue add e cast flood");

    // F9
    buttons_set_label(9, "Stats");
    buttons_set_commands(9, "huntstats");

    // F10
    buttons_set_label(10, "Diag");
    buttons_set_commands(10, "diagnose");

    // F11
    buttons_set_label(11, "Reflection");
    buttons_set_commands(11, "queue add e!wu!t!p cast reflection at me");

    // F12
    buttons_set_label(12, "Shield");
    buttons_set_commands(12, "touch shield");

    break;

  case "Sylvan":
    // F1
    buttons_set_label(1, "Thornrend");
    buttons_set_commands(1, "queue add e!wu!t!p thornrend @tar");
    
    // F2
    buttons_set_label(2, "Torrent");
    buttons_set_commands(2, "queue add !wu!t!p cast torrent at @tar");
    slots["Torrent"] = 2;

    // F3
    buttons_set_label(3, "Sandstorm");
    buttons_set_commands(3, "queue add !wu!t!p cast sandstorm at @tar");
    slots["Sandstorm"] = 3;

    // F4
    buttons_set_label(4, "Thornpierce");
    buttons_set_commands(4, "queue add !wu!t!p thornpierce @tar");
    slots["Thornpierce"] = 4;

    // F5
    buttons_set_label(5, "Stonevine");
    buttons_set_commands(5, "queue add !wu!t!p stonevine @tar");
    slots["Stonevine"] = 5;

    // F6
    buttons_set_label(6, "Leechroot");
    buttons_set_commands(6, "queue add !wu!t!p leechroot @tar");
    slots["Leechroot"] = 6;

    // F7
    buttons_set_label(7, "Rockshot");
    buttons_set_commands(7, "queue add !wu!t!p cast rockshot at @tar");
    slots["Rockshot"] = 7;

    // F8
    buttons_set_label(8, "Flood");
    buttons_set_commands(8, "queue add e cast flood");

    // F9
    buttons_set_label(9, "Stats");
    buttons_set_commands(9, "huntstats");

    // F10
    buttons_set_label(10, "Diag");
    buttons_set_commands(10, "diagnose");

    // F11
    buttons_set_label(11, "Reflection");
    buttons_set_commands(11, "queue add e!wu!t!p cast reflection at me");

    // F12
    buttons_set_label(12, "Shield");
    buttons_set_commands(12, "touch shield");

    break;

  case "Black Dragon":
    dragonMode = get_variable("dragonMode");
    // F1
    dragonAttack = get_variable("dragonAttack");

    if(dragonAttack == "gut") {
      buttons_set_label(1, "Gut");
      buttons_set_commands(1, "queue add eb!wu!t!p gut @tar");      
    } else {
      buttons_set_label(1, "Incantation");
      buttons_set_commands(1, "queue add eb!wu!t!p incantation @tar");
    }
    // F2
    buttons_set_label(2, "Dragonspit");
    buttons_set_commands(2, "queue add !wu!t!p dragonspit @tar");
    slots["Dragonspit"] = 2;

    // F3
    buttons_set_label(3, "Override");
    buttons_set_commands(3, "queue add !wu!t!p override @tar");
    slots["Override"] = 3;

    // F4
    buttons_set_label(4, "Blast");
    buttons_set_commands(4, "queue add eb!wu!t!p blast @tar");

    // F5
    buttons_set_label(5, "Corrode");
    buttons_set_commands(5, "queue add !wu!t!p corrode @tar");
    slots["Corrode"] = 5;

    // F6
    buttons_set_label(6, "Dragonsting");
    buttons_set_commands(6, "queue add !wu!t!p dragonsting @tar");
    slots["Dragonsting"] = 6;

    // F7
    buttons_set_label(7, "Dragonfear");
    buttons_set_commands(7, "queue add !wu!t!p dragonfear @tar");
    slots["Dragonfear"] = 7;

    // F8
    if (dragonMode == "physical") buttons_set_label(8, "PHY");
    if (dragonMode == "magical") buttons_set_label(8, "MAG");
    if (dragonMode == "auto") buttons_set_label(8, "AUT");
      buttons_set_commands(8, "dragonmode");  

    // F9
    buttons_set_label(9, "Stats");
    buttons_set_commands(9, "huntstats");

    // F10
    buttons_set_label(10, "Diag");
    buttons_set_commands(10, "diagnose");

    // F11
    buttons_set_label(11, "Dragonheal");
    buttons_set_commands(11, "queue add eq!wu!t!p dragonheal");

    // F12
    buttons_set_label(12, "Shield");
    buttons_set_commands(12, "touch shield");

    break;

  case "Blue Dragon":
    dragonMode = get_variable("dragonMode");
    // F1
    dragonAttack = get_variable("dragonAttack");

    if(dragonAttack == "gut") {
      buttons_set_label(1, "Gut");
      buttons_set_commands(1, "queue add eb!wu!t!p gut @tar");      
    } else {
      buttons_set_label(1, "Incantation");
      buttons_set_commands(1, "queue add eb!wu!t!p incantation @tar");
    }
    // F2
    buttons_set_label(2, "Dragonchill");
    buttons_set_commands(2, "queue add !wu!t!p dragonchill @tar");
    slots["Dragonchill"] = 2;

    // F3
    buttons_set_label(3, "Override");
    buttons_set_commands(3, "queue add !wu!t!p override @tar");
    slots["Override"] = 3;

    // F4
    buttons_set_label(4, "Blast");
    buttons_set_commands(4, "queue add eb!wu!t!p blast @tar");

    // F5
    buttons_set_label(5, "Frostwave");
    buttons_set_commands(5, "queue add !wu!t!p frostwave @tar");
    slots["Frostwave"] = 5;

    // F6
    buttons_set_label(6, "Ague");
    buttons_set_commands(6, "queue add !wu!t!p ague @tar");
    slots["Ague"] = 6;

    // F7
    buttons_set_label(7, "");
    buttons_set_commands(7, "");

    // F8
    if (dragonMode == "physical") buttons_set_label(8, "PHY");
    if (dragonMode == "magical") buttons_set_label(8, "MAG");
    if (dragonMode == "auto") buttons_set_label(8, "AUT");
      buttons_set_commands(8, "dragonmode");  

    // F9
    buttons_set_label(9, "Stats");
    buttons_set_commands(9, "huntstats");

    // F10
    buttons_set_label(10, "Diag");
    buttons_set_commands(10, "diagnose");

    // F11
    buttons_set_label(11, "");
    buttons_set_commands(11, "");

    // F12
    buttons_set_label(12, "Shield");
    buttons_set_commands(12, "touch shield");

    break;
}

// at the end:
set_variable("rage_slots", slots);
run_function("hl_buttons", [], "hunting");
