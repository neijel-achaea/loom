if (client.track && client.track.area !== undefined) {
  client.track.kills = (client.track.kills || 0) + 1;
  client.track.lastXpAt = Date.now();
}