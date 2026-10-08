// SECURITY [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.security || !client.loom.security.items) run_function("security_setup", [], "security");
var SE = client.loom.security;
var seRaw = String(args[1] || "").trim();
var seWords = seRaw.split(/\s+/);
var seSub = seWords[0].toLowerCase();
var seVal = (seWords[1] || "").toLowerCase();
var C = "cyan";

if (seSub === "" || seSub === "status") {
  run_function("security_status", [], "security");
}
else if (seSub === "help") {
  run_function("security_help", [], "security");
}
else if (seSub === "antitheft") {
  if (seVal === "on" || seVal === "off") {
    set_variable("security_antitheft", seVal);
    display_notice("[security] antitheft " + seVal.toUpperCase() + ".", C);
  } else {
    display_notice("[security] antitheft is " + String(get_variable("security_antitheft")).toUpperCase() + ". SECURITY ANTITHEFT ON or OFF.", C);
  }
}
else if (seSub === "backpack") {
  var seBpRest = seRaw.substring(seWords[0].length).trim();
  if (seBpRest === "") {
    display_notice("[security] backpack: " + (SE.backpack || "not set") + (get_variable("security_backpack_desc") ? " | " + get_variable("security_backpack_desc") : "") + ". SECURITY BACKPACK <id> | <description>.", C);
  } else {
    var seBpParts = seBpRest.split("|");
    SE.backpack = seBpParts[0].trim();
    set_variable("security_backpack", SE.backpack);
    if (seBpParts.length > 1) set_variable("security_backpack_desc", seBpParts[1].trim());
    display_notice("[security] backpack " + SE.backpack + (seBpParts.length > 1 ? " | " + seBpParts[1].trim() : "") + ".", C);
  }
}
else if (seSub === "items") {
  if (SE.items.length === 0) display_notice("[security] no items watched. SECURITY ITEM ADD <wear command> | <description>.", C);
  for (var seI = 0; seI < SE.items.length; seI++) display_notice("  " + (seI + 1) + ". " + SE.items[seI].desc + "  ->  " + SE.items[seI].wear, C);
}
else if (seSub === "item" && seVal === "add") {
  var seAdd = seRaw.replace(/^\S+\s+\S+\s*/, "").split("|");
  if (seAdd.length < 2 || !seAdd[0].trim() || !seAdd[1].trim()) {
    display_notice("[security] SECURITY ITEM ADD <wear command> | <description>, e.g. wear ring123 | a silver ring set with emerald", "orange");
  } else {
    var seNewDesc = seAdd[1].trim().replace(/\.$/, "");
    SE.items.push({ desc: seNewDesc, wear: seAdd[0].trim() });
    set_variable("security_items", SE.items);
    display_notice("[security] watching " + seNewDesc + ".", C);
  }
}
else if (seSub === "item" && seVal === "del") {
  var seN = parseInt(seWords[2], 10);
  if (seN >= 1 && seN <= SE.items.length) {
    var seGone = SE.items.splice(seN - 1, 1)[0];
    set_variable("security_items", SE.items);
    display_notice("[security] no longer watching " + seGone.desc + ".", C);
  } else {
    display_notice("[security] SECURITY ITEM DEL <n>, with n from SECURITY ITEMS.", "orange");
  }
}
else if (seSub === "house") {
  var seHouse = get_variable("security_house") || { "in": "", "out": "" };
  if ((seVal === "in" || seVal === "out") && seWords.length == 2) {
    if (seHouse[seVal]) send_command(seHouse[seVal]);
    else display_notice("[security] no house " + seVal + " command. SECURITY HOUSE SET " + seVal.toUpperCase() + " <command>.", "orange");
  } else if (seVal === "set" && (String(seWords[2]).toLowerCase() === "in" || String(seWords[2]).toLowerCase() === "out")) {
    var seWhich = String(seWords[2]).toLowerCase();
    seHouse[seWhich] = seRaw.replace(/^\S+\s+\S+\s+\S+\s*/, "");
    set_variable("security_house", seHouse);
    display_notice("[security] house " + seWhich + ": " + (seHouse[seWhich] || "cleared") + ".", C);
  } else {
    display_notice("[security] SECURITY HOUSE IN|OUT, or SECURITY HOUSE SET IN|OUT <command>.", "orange");
  }
}
else if (seSub === "debug") {
  display_notice("[security] selfish=" + SE.selfish + " backpack=" + SE.backpack + " items=" + JSON.stringify(SE.items) + " house=" + JSON.stringify(get_variable("security_house")), C);
}
else {
  display_notice("[security] unknown command '" + seSub + "'. SECURITY HELP for commands.", "orange");
}
