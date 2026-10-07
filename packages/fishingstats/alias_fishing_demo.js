run_function("fsh_ensure", [], "fishingstats");
client.fsh = { start: Math.floor(new Date().getTime() / 1000) - 4500, anglers: {}, species: {}, recent: [], n: 0, areas: {}, year: client.fshRec.year || 0, rec: 0, castFt: 0, castN: 0 };
var who = ["Neijel", "Oceana", "Sarapis"];
var fishes = ["pike", "blue eel", "rock bass", "catfish", "walleye", "trout"];
var i;
for (i = 0; i < 34; i++) {
  var w = who[i % 3 === 0 ? 0 : (i % 5 === 0 ? 2 : (i % 2))];
  var extra = (i % 3 === 0) ? 2 : 1;
  var j;
  for (j = 0; j < extra; j++) {
    client.fshEvt = { angler: w, type: "cast" };
    run_function("fsh_event", [], "fishingstats");
  }
  client.fshEvt = { angler: w, type: "hook" };
  run_function("fsh_event", [], "fishingstats");
  var ozv = 12 + ((i * 37) % 900) + (i % 5) * 40;
  client.fshIn = { angler: w, species: fishes[(i * 5) % fishes.length], oz: ozv };
  run_function("fsh_record", [], "fishingstats");
}
display_notice("[fishingstats] demo data loaded into the tab. FPRESET CONFIRM clears it.", "cyan");