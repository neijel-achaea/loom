var who = args[1];
var location = args[2];
var direction = args[3];
var key = who.toLowerCase();

// The social lists may not be loaded yet; without them there is nothing to check.
if (client.hl) {
  if (client.hl.city && client.hl.city[key]) {
    gag_current_line();
  } else if (client.hl.enemies && client.hl.enemies[key]) {
    send_command("pt ENEMY ALERT: " + who + " is " + direction + " of me, at " + location);
  }
}
