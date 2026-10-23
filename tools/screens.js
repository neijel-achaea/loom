// screens.js -- renders every Loom tab with invented data and saves a
// screenshot of each for the player docs (#138). Run through screens.py:
//   python3 tools/screens.py            -> docs/img/<tab>.png
// Needs node and playwright (npm i -g playwright, with a Chromium for it).
// Same build, same pictures: the clock is fixed and dates print in UTC.
// Everything shown is made up: names, numbers, rooms. Nothing comes from a
// real character.
"use strict";
process.env.TZ = "UTC";
const fs = require("fs");
const path = require("path");
const sim = require("./sim.js");

const ROOT = path.resolve(__dirname, "..");
// The simulated page stubs the clock and timers on `global`; the browser
// driver needs the real ones back before it runs.
const REAL = { setTimeout, clearTimeout, setInterval, clearInterval, now: Date.now, Date };
function realTime() { Object.assign(global, { setTimeout: REAL.setTimeout, clearTimeout: REAL.clearTimeout, setInterval: REAL.setInterval, clearInterval: REAL.clearInterval, Date: REAL.Date }); REAL.Date.now = REAL.now; }
// `new Date()` with no arguments reads the simulated clock too (coffers and
// levelgraph take their samples from it).
function simDate() {
  const D = REAL.Date;
  class SimDate extends D { constructor(...a) { if (a.length) super(...a); else super(sim.W.now); } }
  SimDate.now = () => sim.W.now;
  global.Date = SimDate;
}
const OUT = process.argv[2] || path.join(ROOT, "docs", "img");
const WIDTH = 380;

// ---- The world --------------------------------------------------------
const ME = "Tamsin";
const DAY = 86400000;
// Experience as the game reports it: level, and percent to the next.
const XP = { lvl: 72, nl: 5 };
function level() { return XP.lvl + " (" + XP.nl + "%)"; }
function gain(p) { XP.nl += p; if (XP.nl >= 100) { XP.nl -= 100; XP.lvl++; } }

function g(method, args) { sim.gmcp(method, args); }
function line(s) { sim.line(s); sim.flush(); }
function type(cmd) {
  const W = sim.W;
  for (const p of W.installed) for (const r of sim.PKGS[p].reflexes) {
    if (r.type !== "alias") continue;
    const m = sim.match(r, cmd);
    if (!m) continue;
    W.line = cmd;
    for (const a of r.actions || []) if (a.type === "script" && a.script) sim.exec(p, "alias " + cmd, a.script, m);
    sim.flush();
    return;
  }
}
function vitals(hp, mp, extra) {
  g("Char.Vitals", Object.assign({ hp: String(hp), maxhp: "4200", mp: String(mp), maxmp: "3600", ep: "15000", maxep: "16000", wp: "14000", maxwp: "15000", nl: String(XP.nl), bal: "1", eq: "1", string: "", charstats: ["Bleed: 0", "Rage: 24"] }, extra || {}));
}
function prompt(hp, mp) { vitals(hp || 4200, mp || 3600); sim.line("4200h, 3600m, 15000e, 14000w ex-"); sim.flush(); }

function build(P) {
  const names = Object.keys(P).filter(n => !["groves", "reclamation"].includes(n));
  sim.newWorld(names, {
    // Saved state a player would have built up over time.
    social_groups: JSON.stringify({ friends: ["Corwen", "Ilsabet", "Maren"], enemies: ["Vasker", "Orlok"], city: ["Corwen", "Maren", "Ilsabet", "Tobin"], allies: ["Sefa"] }),
  });
  // The story starts a fortnight before 1 October 2026, 18:00 UTC.
  sim.W.now = Date.UTC(2026, 8, 17, 18, 0, 0);
  // Styles that tabs inject into the page, kept so the screenshot has them.
  const styles = {};
  const mk = (tag) => {
    const el = { tagName: String(tag).toUpperCase(), style: {}, id: "", textContent: "", innerHTML: "", children: [],
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      setAttribute(k, v) { this[k] = v; }, appendChild(c) { if (c && c.id) styles[c.id] = c; return c; }, remove() {}, addEventListener() {},
      querySelector() { return null; }, querySelectorAll() { return []; } };
    return el;
  };
  global.document = {
    getElementById: id => styles[id] || null,
    createElement: mk, head: mk("head"), body: mk("body"),
    querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
  };
  global.document.head.appendChild = c => { if (c && c.id) styles[c.id] = c; return c; };
  global.nexusclient = { add_html_line: () => {} };
  return { names, styles };
}

function identity() {
  sim.load("install");
  g("Char.Name", { name: ME, fullname: "Tamsin Thornfield" });
  g("Char.Status", { name: ME, fullname: "Tamsin Thornfield", age: "31", race: "Human", specialisation: "", level: "74 (63%)", xp: "63%", xprank: "842", class: "Druid", city: "Eleusis (3)", house: "The Verdant Circle", order: "", boundcredits: "0", unboundcredits: "0", lessons: "40", explorerrank: "311", gold: "48,210", bank: "120,000", unread_news: "0", unread_msgs: "0", target: "None", gender: "female" });
  vitals(4200, 3600);
  line("It is now the 28th of Phaestian, 1022 years after the Coming of the Sun.");
}

// Where the screenshots are taken: an oak wood, mid-hunt, chatter on the channels.
function here() {
  g("Char.Afflictions.List", [{ name: "clumsiness", cure: "eat kelp", desc: "" }, { name: "asthma", cure: "eat kelp", desc: "" }]);
  g("Char.Defences.List", [{ name: "deafness", desc: "" }, { name: "blindness", desc: "" }, { name: "insomnia", desc: "" }, { name: "selfishness", desc: "" }, { name: "mass", desc: "" }, { name: "nightsight", desc: "" }]);
  g("Room.Info", { num: 8814, name: "Beneath a canopy of whispering oaks", area: "the Western Ithmia", environment: "Forest", coords: "", map: "", exits: { n: 8813, e: 8815, sw: 8820 }, details: [] });
  g("Room.Players", [{ name: ME, fullname: "Tamsin Thornfield" }, { name: "Corwen", fullname: "Corwen Ashdale" }, { name: "Vasker", fullname: "Vasker" }]);
  g("Char.Items.List", { location: "room", items: [
    { id: "4101", name: "a grey wolf", attrib: "m" }, { id: "4102", name: "a grey wolf", attrib: "m" },
    { id: "4103", name: "a wild boar", attrib: "m" }, { id: "4110", name: "a shrine of Gaia", attrib: "" },
    { id: "4111", name: "a monolith sigil", attrib: "" }, { id: "4120", name: "a gold sovereign", attrib: "t" },
    { id: "4121", name: "a bundle of kindling", attrib: "t" }] });
  g("IRE.Target.Set", "4101");
  g("IRE.Target.Info", { id: "4101", short_desc: "a grey wolf", hpperc: "64%" });
  g("Comm.Channel.List", [{ name: "ct", caption: "Eleusis", command: "ct" }, { name: "pt", caption: "Party", command: "pt" }, { name: "says", caption: "Says", command: "say" }]);
  const lines = [
    ["ct", "Corwen", "\u001b[1;33m(Eleusis): Corwen says, \"The southern grove needs tending again.\"\u001b[0;37m"],
    ["ct", "Maren", "\u001b[1;33m(Eleusis): Maren says, \"I'll take it after the meeting.\"\u001b[0;37m"],
    ["pt", "Ilsabet", "\u001b[1;36m(Party): Ilsabet says, \"Wolves to the east, two of them.\"\u001b[0;37m"],
    ["says", "Corwen", "Corwen says, \"Careful, Tamsin, Vasker is about.\""],
    ["tell Maren", "Maren", "\u001b[1;32mMaren tells you, \"Meet at the oak when you're done?\"\u001b[0;37m"],
    ["ct", "Tobin", "\u001b[1;33m(Eleusis): Tobin says, \"Anyone selling kelp?\"\u001b[0;37m"],
  ];
  for (const [ch, who, text] of lines) { g("Comm.Channel.Text", { channel: ch, talker: who, text }); sim.advance(4000); }
  prompt();
}

// Past days: gold and experience move a little each day, so the long-term
// graphs (Coffers, Level, Talismans) have something to draw.
function history() {
  let gold = 30000, bank = 90000;
  const kinds = ["Claw", "Scale", "Tooth", "Bone", "Eye", "Heart", "Leather"];
  const colours = ["Black", "Blue", "Gold", "Green", "Red", "Silver"];
  for (let d = 0; d < 14; d++) {
    for (let h = 0; h < 3; h++) {
      gold += 900 + ((d * 7 + h * 3) % 5) * 400; gain(5 + (d + h) % 4);
      g("Char.Status", { gold: gold.toLocaleString("en-US"), bank: bank.toLocaleString("en-US"), level: level() });
      vitals(4200, 3600, { nl: String(XP.nl) });
      sim.advance(2000);
      vitals(4200, 3600, { nl: String(XP.nl) });
      sim.line("4200h, 3600m, 15000e, 14000w ex-");
      for (let k = 0; k < 6 + (d % 4) * 3; k++) line("You have found a " + colours[(d + k) % 6] + " Dragon's " + kinds[(d * 3 + k) % 7] + " (level " + (1 + (k % 6)) + ") talisman piece!");
      sim.advance(20 * 60000);
    }
    if (d % 5 === 4) { bank += 20000; gold -= 20000; }
    sim.advance(DAY - 60 * 60000);
  }
}

// People, standings and reminders.
function people() {
  for (const c of ["social add friends Ilsabet", "social add friends Maren", "social add city Corwen", "social add city Tobin",
    "social add city Maren", "social add enemies Vasker", "social add enemies Orlok", "social add allies Sefa",
    "social watch friends", "social watch city", "social watch enemies", "social watch allies"]) type(c);
  type("social reset");
  type("social poll now");
  line("Corwen, Ilsabet, Maren, Vasker, Sefa, and Tobin.");
  line("(6 total).");
  sim.advance(3000);
  for (const c of ["standings Corwen ++ shared his grove in a storm", "standings Maren +++ always there", "standings Ilsabet +",
    "standings Vasker --- attacked me in the grove", "standings Orlok -", "standings Sefa + traded fairly"]) { type(c); sim.advance(60000); }
  line("It is now the 12th of Scarlatan, 1023 years after the Coming of the Sun.");
  for (const c of ["ledger add Renew the grove wards @ +2 days", "ledger add Pay the house dues @ +12 days repeat",
    "ledger add Return Maren's book about Ithmia", "ledger add Teach Tobin to brew @ +5 days"]) type(c);
}

// A hunt in two areas: kills, gold, experience and some damage both ways.
function hunts() {
  const areas = [["the Western Ithmia", 8814, ["a grey wolf", "a wild boar"]], ["the Arcadian Forest", 9120, ["a dusky satyr", "a forest nymph"]]];
  let gold = Number(String((client.loom.coffers && client.loom.coffers.live && client.loom.coffers.live.gold) || 60600));
  for (const [area, room, mobs] of areas) {
    g("Room.Info", { num: room, name: "A clearing in " + area, area, environment: "Forest", exits: { n: room + 1 }, details: [] });
    for (let k = 0; k < 14; k++) {
      for (let hit = 0; hit < 3; hit++) {
        line("Damage dealt: " + (380 + (k * 37 + hit * 11) % 160) + " (" + (hit % 2 ? "cutting" : "nature") + ").");
        if (hit === 1) { line("Health lost: " + (90 + (k * 23) % 140) + " (" + (k % 3 ? "blunt" : "cutting") + ")."); vitals(4200 - 300, 3600); }
        sim.advance(2500);
      }
      line("You have slain " + mobs[k % 2] + ".");
      line("You have gained " + (1100 + (k * 61) % 400) + " experience.");
      gain(1);
      g("Char.Status", { level: level() });
      vitals(4200, 3600, { nl: String(XP.nl) });
      if (k % 2) {
        const got = 40 + (k * 13) % 90;
        gold += got;
        line("You pick up " + got + " gold sovereigns.");
        g("Char.Status", { gold: gold.toLocaleString("en-US") });
        sim.advance(1000);
        vitals(4200, 3600, { nl: String(XP.nl) });
      }
      sim.advance(40000);
    }
    sim.advance(5 * 60000);
  }
}

// ---- Rendering --------------------------------------------------------
function tabsNow(styles) {
  const css = Object.values(styles).map(s => s.textContent || "").join("\n");
  return { css, tabs: Object.assign({}, sim.W.tabs) };
}

async function shoot(shots, out, dark) {
  const pw = require(path.join(require("child_process").execSync("npm root -g").toString().trim(), "playwright"));
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 600 }, deviceScaleFactor: 2, colorScheme: dark ? "dark" : "light" });
  // Nothing leaves the machine: web fonts and other outside requests are
  // refused, so the tabs fall back to the system's fonts.
  await page.route(/^https?:/, r => r.abort());
  fs.mkdirSync(out, { recursive: true });
  const done = [];
  for (const [tab, html] of Object.entries(shots.tabs)) {
    const file = tab.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".png";
    await page.setContent('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#111;}' +
      '.flexlayout__tab{width:' + WIDTH + 'px;overflow:hidden;position:relative;}</style><style>' + shots.css + '</style></head>' +
      '<body><div class="flexlayout__tab" id="shot"><div>' + html + '</div></div></body></html>', { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(50);
    const el = await page.$("#shot");
    await el.screenshot({ path: path.join(out, file) });
    done.push(file);
  }
  await browser.close();
  return done;
}

async function main() {
  const P = sim.loadDist(path.join(ROOT, "dist"));
  sim.use(P);
  const { styles } = build(P);
  simDate();
  identity();
  history();
  // A fresh login after those days (the page reloaded), as on a new evening.
  sim.load("load");
  g("Char.Name", { name: ME, fullname: "Tamsin Thornfield" });
  sim.advance(25 * 60000);
  people();
  hunts();
  here();
  type("partycomms test");
  type("fishingstats demo");
  type("fishingstats end");
  type("fishingstats demo");
  type("basher on");
  type("standings");
  // The ledger shot shows the player's own reminders only.
  if (client.loom.loom && client.loom.loom.setLink) client.loom.loom.setLink("talpieces-ledger", false);
  // Two mob types made active in the Basher tab, as the player would click them.
  const B = client.loom.basher;
  if (B && B.prio) { B.prio("toggle", 0); B.prio("toggle", 1); sim.flush(); }
  sim.renders();
  const shots = tabsNow(styles);
  realTime();
  const done = await shoot(shots, OUT, false);
  const f = [...sim.FIND.values()].filter(x => x.kind === "throws");
  for (const x of f) console.error("throws:", x.pkg, x.where, x.msg);
  console.log(done.length + " tabs: " + done.join(", "));
}
main().catch(e => { console.error(e); process.exit(1); });
