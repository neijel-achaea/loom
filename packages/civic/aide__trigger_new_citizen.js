var newbie = args[1];

// Add them to the city highlight group, if the social package is installed.
if (client.hl) send_command("hladd city " + newbie);
display_notice("[civic] new citizen: " + newbie + ". Welcome them with CIVIC GREET " + newbie + ".", "cyan");
