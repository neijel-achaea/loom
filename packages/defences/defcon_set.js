var activeClass = get_variable("activeClass");
var DEFS = "";
switch (activeClass) {
  case "Druid":
    DEFS = [["alertness", 1, 10, true], ["vigilance", 1, 10, true], ["hypersight", 1, 9, true], ["telesense", 1, 10, true], ["metawake", 1, 9, true], ["mass", 2, 8], ["rebounding", 2, 2], ["heldbreath", 2, 20], ["fangbarrier", 3, 8], ["deafness", 3, 4], ["blindness", 3, 4], ["temperance", 3, 12], ["vitality", 3, 7], ["curseward", 2, 9], ["kola", 3, 3], ["levitating", 3, 15], ["speed", 3, 5], ["harmony", 3, 11], ["poisonresist", 3, 8], ["nightsight", 4, 13], ["deathsight", 4, 18], ["thirdeye", 4, 5], ["insomnia", 2, 6], ["selfishness", 2, 17], ["mindseye", 5, 1]];
    break;

  case "Magi":
    DEFS = [["alertness", 1, 10, true], ["vigilance", 1, 10, true], ["hypersight", 1, 9, true], ["telesense", 1, 10, true], ["metawake", 1, 9, true], ["mass", 2, 8], ["rebounding", 2, 2], ["heldbreath", 2, 20], ["fangbarrier", 3, 8], ["deafness", 3, 4], ["blindness", 3, 4], ["curseward", 2, 9], ["kola", 3, 3], ["levitating", 3, 15], ["speed", 3, 5], ["poisonresist", 3, 8], ["insulation", 3, 8], ["nightsight", 4, 13], ["deathsight", 4, 18], ["thirdeye", 4, 5], ["insomnia", 2, 6], ["selfishness", 2, 17], ["mindseye", 5, 1], ["stoneskin", 4, 10], ["diamondskin", 4, 10], ["stonefist", 3, 11, true], ["chargeshield", 3, 15], ["temperance", 3, 8]];
    break;

  case "Sylvan":
    DEFS = [["alertness", 1, 10, true], ["vigilance", 1, 10, true],         ["hypersight", 1, 9, true], ["telesense", 1, 10, true], ["metawake", 1, 9, true], ["mass", 2, 8], ["rebounding", 2, 2], ["heldbreath", 2, 20], ["fangbarrier", 3, 8], ["deafness",     3, 4], ["blindness", 3, 4], ["curseward", 2, 9], ["kola", 3, 3], ["levitating", 3, 15], ["speed", 3, 5], ["poisonresist", 3, 8], ["nightsight", 4, 13], ["deathsight", 4, 18], ["thirdeye",     4, 5], ["insomnia", 2, 6], ["selfishness", 2, 17], ["mindseye", 5, 1], ["barkskin", 3, 10], ["temperance", 3, 8]];
    break;
    
  case "Black Dragon":
  case "Blue Dragon":
    DEFS = [["alertness", 1, 10, true], ["vigilance", 1, 10, true], ["hypersight", 1, 9, true], ["telesense", 1, 10, true], ["metawake", 1, 9, true], ["mass", 2, 8], ["rebounding", 1, 2], ["heldbreath", 2, 20], ["fangbarrier", 4, 8], ["deafness", 4, 4], ["blindness", 4, 4], ["curseward", 1, 9], ["kola", 4, 3], ["levitating", 4, 15], ["speed", 4, 5], ["poisonresist", 4, 8], ["insulation", 3, 8], ["nightsight", 5, 13], ["deathsight", 5, 18], ["thirdeye", 5, 5], ["insomnia", 2, 6], ["selfishness", 2, 17], ["mindseye", 5, 1], ["dragonbreath", 4, 10], ["dragonarmour", 3, 5, true], ["temperance", 3, 8]];
    break;
}

var stored = get_variable("defcon_level");
var old    = (stored == null) ? 5 : stored;
var first  = (stored == null);

if (args.level == null) {
    display_notice("Defcon is currently " + old + (first ? " (default)." : "."), "cyan");
} else {
    var level  = args.level;
    var resync = (level === old) || first;
    var queue  = [];

    for (var i = 0; i < DEFS.length; i++) {
        var name = DEFS[i][0];
        var prio = DEFS[i][2];
        var want = DEFS[i][1] >= level;
        var had  = DEFS[i][1] >= old;
        var drain = DEFS[i][3];   // add alongside name/prio/want/had
        
        if (resync) {
          if (want) {
              queue.push("curing priority defence " + name + " " + prio);
          } else {
              queue.push("curing priority defence " + name + " reset");
              if (drain) queue.push("relax " + name);
          }
      } else if (want && !had) {
          queue.push("curing priority defence " + name + " " + prio);
      } else if (!want && had) {
          queue.push("curing priority defence " + name + " reset");
          if (drain) queue.push("relax " + name);
      }
    }

    set_variable("defcon_level", level);
    window.defcon_queue = queue;

    if (window.defcon_timer) { clearTimeout(window.defcon_timer); window.defcon_timer = null; }

    if (queue.length === 0) {
        display_notice("[defences] Defcon " + level + " \u2014 no changes.", "cyan");
    } else {
        display_notice("[defences] Defcon " + level + " \u2014 applying " + queue.length + " changes...", "cyan");
        run_function("defcon_drain", {}, "defences");
    }
}