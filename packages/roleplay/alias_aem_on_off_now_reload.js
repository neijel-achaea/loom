var activeClass = get_variable("activeClass");

// ---- bootstrap the engine once per session ----
if (!window.AEM) {
  var AEM = {};

  switch (activeClass) {
    case "Magi":
      AEM.emotes = [
  // Nostalgic: the old sleeper, now with new tools in his hands
  { weight: 3, text: "emote runs his thumb along his staff, a small private smile surfacing and fading." },
  { weight: 5, text: "emote turns a small crystal over in his fingers, watching the light fold within it." },
  { weight: 1, text: "emote goes still, one hand lifted, like a man who has just remembered someone long gone." },
  { weight: 2, text: "emote pauses, head canted, as though listening for a resonance he has not heard in centuries." },

  // Attuned: nature is now read through the elements
  { weight: 3, text: "emote draws a slow breath, and the air about him cools a shade before warming again." },
  { weight: 3, text: "emote turns his palm upward as though testing for rain, and a single bead of water gathers there before he lets it fall." },
  { weight: 3, text: "emote lets a thread of static crawl between two fingertips before closing his hand gently upon it." },
  { weight: 1, text: "emote follows the path of some small creature with quiet, unhurried attention." },
  { weight: 1, text: "emote calls forth a shimmering treaty with a murmured word, runs his eyes down its binding clauses, and dismisses it with a small satisfied nod." },

  // Contemplative: the scholar-artificer's idle habits
  { weight: 2, text: "emote rolls a glittering pearl between finger and thumb, holds it to the light, and tucks it away unsatisfied." },
  { weight: 5, text: "emote sets a small crystal spinning in the air before him without looking at it, catches it, and sets it spinning again." },
  { weight: 3, text: "emote breathes on one of the gems set in his staff and polishes it on his sleeve, turning it to the light to judge the result." },
  { weight: 5, text: "emote rolls a fragment of dried leaf between finger and thumb until it crumbles away." },
  { weight: 3, text: "emote settles his weight against his staff and simply observes, patient as old stone." },
  { weight: 2, text: "emote lets his eyes rest on nothing at all, lips moving on some silent calculation." },
  { weight: 1, text: "emote arches a brow at something no one else can see, one corner of his mouth twitching." }
];
      break;
    case "Druid":
  AEM.emotes = [{ weight: 2, text: "emote pauses mid-step, his gaze drifting to some middle distance, as though a memory had briefly overtaken the present." }, { weight: 5, text: "emote runs his thumb along the grain of his staff, a small private smile surfacing and fading." }, { weight: 1, text: "emote goes still, one hand half-raised, like a man who has just remembered someone long gone." }, { weight: 2, text: "emote turns his head toward some sound only he seems to have caught, holding still until it passes." }, { weight: 2, text: "emote lets his gaze travel unhurriedly around the room, marking each way out without seeming to." }, { weight: 2, text: "emote glances over his shoulder, then eases, as if reassuring himself the quiet held nothing." }, { weight: 2, text: "emote narrows his eyes at a flicker of movement at the edge of his vision, watching until it resolves into nothing." }, { weight: 1, text: "emote tilts his head, going briefly motionless, as though the air had carried him something." }, { weight: 1, text: "emote draws a slow breath through his nose, reading the air the way another might read a page." }, { weight: 1, text: "emote lowers a hand toward the ground, fingers spread, and holds it there a moment as if listening through his skin." }, { weight: 5, text: "emote follows the path of some small creature with quiet, unhurried attention." }, { weight: 10, text: "emote brushes something unseen from his palm and watches it fall." }, { weight: 5, text: "emote settles his weight against his staff and simply observes, patient as old stone." }, { weight: 10, text: "emote rolls a fragment of dried leaf between finger and thumb until it crumbles away." }, { weight: 1, text: "emote lets his eyes rest on nothing at all, his thoughts plainly elsewhere." }, { weight: 2, text: "emote arches a brow at something no one else can see, one corner of his mouth twitching." }];
      break;

    case "Black Dragon":
AEM.emotes = [{ weight: 2, text: "emote goes still, his great head lifting slightly, eyes fixed on some middle distance as though a memory had surfaced from a long way down." }, { weight: 10, text: "emote (A single dark drop gathers at the edge of)'s jaw and falls, hissing into a thread of smoke that is gone before it lands." }, { weight: 1, text: "emote holds one vast clawed forelimb half-raised, motionless, like something recalling a shape it has not held in a very long time." }, { weight: 2, text: "emote turns his flattened snout toward a sound no one else has caught, the long neck still, until whatever it was has passed." }, { weight: 2, text: "emote lets his gaze travel the room without haste, the dark eyes marking each way out and giving no sign of having done so." }, { weight: 10, text: "emote (A slow breath leaves)'s snout, and for a moment the air before it shimmers with a heat that smells of scorched stone." }, { weight: 2, text: "emote narrows his eyes at a flicker at the edge of sight, the whole immense form utterly still until it resolves into nothing." }, { weight: 5, text: "emote drags the tip of one claw a slow inch across the ground, leaving a thin dark line that smokes faintly and fades." }, { weight: 1, text: "emote tilts the great head, going briefly motionless, as though the air had carried him something worth keeping." }, { weight: 1, text: "emote draws a long breath through his nostrils, reading the air the way another might read a page." }, { weight: 1, text: "emote settles the massive dark weight of himself and simply watches, patiently." }, { weight: 5, text: "emote follows the path of some small creature across the floor with quiet, unhurried attention, making no move toward it." }, { weight: 10, text: "emote (A bead of something dark wells at the tip of) 's talon, drips, and sizzles into a thread of smoke before it reaches the ground." }, { weight: 1, text: "emote lets the saucer eyes rest on nothing at all, the vast head lowered, his thoughts plainly a long way off." }, { weight: 2, text: "emote lowers his head near the ground and holds it there, nostrils wide, as if listening to the earth through the heat of his own breath." }, { weight: 2, text: "emote curls one corner of his lip from a razor-edged tooth at something no one else can see, the nearest thing to a private smile." }, { weight: 10, text: "emote shifts his weight, and the ground notices." }
];      
      break;
  }

  AEM.minMinutes = 15;
  AEM.maxMinutes = 19;

  AEM.pick = function () {
    var total = AEM.emotes.reduce(function (s, e) { return s + e.weight; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < AEM.emotes.length; i++) {
      r -= AEM.emotes[i].weight;
      if (r <= 0) return AEM.emotes[i].text;
    }
    return AEM.emotes[AEM.emotes.length - 1].text;
  };

  AEM.schedule = function () {
    clearTimeout(AEM.timer);
    var span = (AEM.maxMinutes - AEM.minMinutes) * 60000;
    var delay = AEM.minMinutes * 60000 + Math.random() * span;
    AEM.timer = setTimeout(AEM.fire, delay);
  };

  AEM.fire = function () {
    if (get_variable("aem_on") === "1") send_command(AEM.pick());
    AEM.schedule();
  };

  AEM.start = function () {
    set_variable("aem_on", "1");
    AEM.schedule();
    display_notice("[roleplay] Ambient emotes: ON", "cyan");
  };

  AEM.stop = function () {
    set_variable("aem_on", "0");
    clearTimeout(AEM.timer);
    display_notice("[roleplay] Ambient emotes: OFF", "cyan");
  };

  window.AEM = AEM;
}

// ---- command dispatch ----
var arg = args[1] || "";

if (arg === "on")          { window.AEM.start(); }
else if (arg === "off")    { window.AEM.stop(); }
else if (arg === "now")    { send_command(window.AEM.pick()); window.AEM.schedule(); }
else if (arg === "reload") { if (window.AEM) window.AEM.stop(); window.AEM = null; display_notice("[roleplay] Engine cleared — run AEM ON to rebuild.", "cyan"); }
else {
  var state = get_variable("aem_on") === "1" ? "ON" : "OFF";
  display_notice("[roleplay] Ambient emotes are currently " + state + ". Use AEM ON / OFF / NOW / RELOAD.", "cyan");
}