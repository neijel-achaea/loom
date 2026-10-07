// Stores rage cost for all rage abilities across classes
set_variable("rage_global", "true");

set_variable("rage_costs", {
  // Druid
  Strangle: 14, Redeem: 22, Vinecrack: 17, Ravage: 36, Sear: 25, Glare: 14,

  // Magi
  Windlash: 14, Dilation: 35, Disintegrate: 17, Squeeze: 36, Firefall: 25, 
  Stormbolt: 25,

  // Sylvan
  Torrent: 14, Sandstorm: 29, Thornpierce: 17, Stonevine: 36, Leechroot: 25, 
  Rockshot: 28,

  // Black Dragon
  Dragonspit: 14, Dragonsting: 25, Dissolve: 17, Override: 36, Corrode: 25, 
  Dragonfear: 29, Provoke: 32,

  // Blue Dragon
  Dragonchill: 14, Glaciate: 26, Frostrive: 17, Frostwave: 25, Ague: 14,
  
  // Silver Dragon
});

display_notice("[hunting] Rage abilities updated.");