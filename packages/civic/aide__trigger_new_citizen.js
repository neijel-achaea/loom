var newbie = args[1];

// Add them to the city highlight group, if the social package is installed.
if (client.loom && client.loom.registry && client.loom.registry.social) send_command("social add city " + newbie);
display_notice("[civic] new citizen: " + newbie + ". Welcome them with CIVIC GREET " + newbie + ".", "cyan");
