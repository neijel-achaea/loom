var who = args[1];
var location = args[2];
var direction = args[3];

if (client.hl && client.hl.city[who.toLowerCase()]) {
    gag_current_line();
} else {
  if (client.hl.enemies[who.toLowerCase()]) {
    send_command("pt ENEMY ALERT: " + who + " is " + direction + " of me, at " + location);
  }
}