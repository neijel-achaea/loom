var newbie = args[1];

send_command("hladd city " + newbie);
display_notice("[eleusis] New citizen: " + newbie + ". Greet him with NEWBIECT, NEWBIECLT or NEWBIEBOTH", "cyan");