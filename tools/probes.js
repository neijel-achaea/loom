// probes.js -- Here's silent loyal probe against the game, on a clock
// (#393, #396). The game is played as packets in time: each carries its text
// and ends with its prompt line (a standard prompt, or a custom one showing
// health and mana), with the prompt message (Char.Vitals) ahead of the text
// or after it. Every probe Here sends is answered a round trip (150 ms) later.
// Situations:
//   walk, fast, follow  passing through rooms (150, 80, 400 ms apart; following
//                       adds "You follow …"): nothing may be probed
//   linger              2.6 s in each room, someone speaking meanwhile
//   arrive              standing while mobs walk in
//   attacked            a mob walks in and hits you twice: nothing is probed
//                       while you lose health; it is once things are calm
//   busy                a line nobody asked for arrives between a probe and its
//                       answer: hidden, then shown again, in order
// Fails if a room, say, arrival, attack or prompt line is lost, a probe's
// answer shows, lines shown again are out of order, a mob in a calm room isn't
// read, or a probe goes out while passing through or while you're being hurt.
//   node tools/probes.js [dist]      exit 1 on any problem
"use strict";
const path = require("path");
const sim = require("./sim.js");
const P = sim.loadDist(process.argv[2] || path.join(__dirname, "..", "dist"), ["loom", "room"]);
sim.use(P);

function run(MODE, ORDER, PROMPTS) {
  sim.newWorld(["loom", "room"], {});
  global.nexusclient = { add_html_line: () => {} };
  sim.load("install");
  for (const [m, a] of sim.GOOD.filter(g => !/^Room|Char.Items|IRE.Target|Comm/.test(g[0]))) sim.gmcp(m, a);
  sim.flush();
  const W = sim.W, R = () => client.loom.room;
  const lost = [], ansShown = [], shownAgain = [], hiddenSeq = [];
  let kind = "", gagged = false, pk = 0, hp = 3000;
  // Lines room shows again (one block, split on "\n"), in the order shown.
  const keep = t => { for (const l of String(t).replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").split("\n")) shownAgain.push(l.trim()); };
  global.nexusclient = { add_html_line: keep };
  global.display_notice = t => keep(t);
  global.gag_current_line = () => { gagged = true; if (kind !== "answer") { lost.push(W.line.trim()); hiddenSeq.push(W.line.trim()); } };
  // Every probe sent, with when; and when health went down.
  const probesAt = [], hurtAt = [];
  const send0 = global.send_command;
  global.send_command = c => { send0(c); if (/^probe \d+/.test(String(c))) probesAt.push({ cmd: String(c), t: W.now, answered: false }); };

  const vit = () => sim.gmcp("Char.Vitals", Object.assign({}, sim.GOOD[2][1], { hp: String(hp) }));
  const PROMPT = () => PROMPTS ? hp + "h, 5989m, 35230e, 30144w exkdb-" : "[H:" + hp + " M:2000] >";
  function packet(gmcps, lines, hurt) {
    const ahead = ORDER[pk++ % ORDER.length] === "A";
    if (hurt) { hp -= hurt; hurtAt.push(W.now); }
    for (const g of gmcps) sim.gmcp(g[0], g[1]);
    if (ahead) vit();
    for (const [t, k] of lines.concat([[PROMPT(), "prompt"]])) { kind = k; gagged = false; sim.line(t); if (k === "answer" && !gagged) ansShown.push(t); }
    if (!ahead) vit();
    sim.flush();
  }
  // The game's mobs, and what PROBE answers for each.
  const MOB = {}; let here = 0;
  function answer(cmd) {
    const id = cmd.split(" ")[1], m = MOB[id];
    if (!m || m.room !== here) return [["What do you wish to examine?", "answer"]];
    return [["Seen up close, " + m.name + " is described at length here.", "answer"], [m.name + " is quite powerful.", "answer"], ["He has 100% health remaining.", "answer"], ["He weighs about 90 pounds.", "answer"], ["He is loyal to " + (m.owner || "Luman Village") + ".", "answer"], ["You see nothing in it.", "answer"]];
  }
  // Time moves on, packet by packet: `events` are [ms from now, fn]. Probes
  // sent meanwhile are answered 150 ms after they went out; with `busy`, a
  // line nobody asked for comes 60 ms after each probe, before its answer.
  function play(events, until) {
    const end = W.now + until;
    const q = events.map(([ms, fn]) => ({ t: W.now + ms, fn }));
    for (;;) {
      for (const p of probesAt) if (!p.queued) {
        p.queued = true;
        if (MODE === "busy") q.push({ t: p.t + 60, fn: () => packet([], [["A gentle breeze ruffles your hair.", "room"], ["Somewhere, a bird calls.", "room"]]) });
        q.push({ t: p.t + 150, fn: () => packet([], answer(p.cmd)) });
      }
      q.sort((a, b) => a.t - b.t);
      // Small steps, so a probe Here's timer sends is answered on time.
      const until = Math.min(q.length ? q[0].t : end, end, W.now + 10);
      if (until > W.now) { sim.advance(until - W.now); continue; }
      if (q.length && q[0].t <= W.now) { q.shift().fn(); continue; }
      if (W.now >= end) break;
    }
  }
  const roomPacket = n => {
    here = n; const id = String(5000 + n);
    MOB[id] = { room: n, name: "Nulem" + n, owner: n % 4 === 0 ? "Falau" : "" };
    return () => packet([["Room.Info", { num: 100 + n, name: "Room " + n + " by the sea", area: "Luman", environment: "Road", exits: { n: 1 }, details: [] }], ["Char.Items.List", { location: "room", items: [{ id, name: "an unruly young boy", attrib: "m" }] }]],
      [...(MODE === "follow" ? [["You follow Corwen to the north.", "room"]] : []), ["Room " + n + " by the sea. (road)", "room"], ["Dawn breaks across the land. An unruly young boy stands here.", "room"], ["You see exits leading north and south.", "room"]]);
  };
  const say = n => () => { sim.gmcp("Comm.Channel.Text", { channel: "says", talker: "Corwen", text: 'Corwen says, "Room ' + n + '."' }); packet([], [['Corwen says, "Room ' + n + '."', "room"]]); };
  const mobIn = (n, name, line, owner) => () => { const id = String(7000 + n); MOB[id] = { room: here, name, owner: owner || "" }; packet([["Char.Items.Add", { location: "room", item: { id, name: name.toLowerCase(), attrib: "m" } }]], [[line, "room"]]); };

  const step = { walk: 150, fast: 80, follow: 400 }[MODE];
  for (let n = 0; n < 24; n++) {
    if (step) play([[0, roomPacket(n)]], step);
    else if (MODE === "linger" || MODE === "busy") play([[0, roomPacket(n)], [1000, say(n)]], 2600);
    else if (MODE === "arrive") play(n === 0 ? [[0, roomPacket(0)]] : [[0, mobIn(n, "A gnoll sentinel", "A gnoll sentinel enters from the north.")]], 3000);
    else if (MODE === "attacked") play(n === 0 ? [[0, roomPacket(0)]] : [
      [0, mobIn(n, "A bunyip", "Slowly rising from the swampy waters is a hulking bunyip.")],
      [130, () => packet([], [["A bunyip's eyes gleam as you are butchered with a wicked blow.", "room"], ["Health lost: 888 (physical blunt).", "room"]], 888)],
      [1600, () => packet([], [["Fire erupts in your side as a bunyip carves you up.", "room"], ["Health lost: 544 (physical cutting).", "room"]], 544)],
      [1700, () => { hp = 3000; packet([], [["The elixir heals and soothes you.", "room"]]); }]], 4500);
  }
  // Passing through: count the probes sent on the way, then stop in the
  // last room (where a probe is right).
  const onTheWay = probesAt.length;
  play([], 3000);

  // Shown again in the order they were hidden? A line shown again isn't lost.
  const again = shownAgain.filter(l => hiddenSeq.includes(l));
  const orderOk = JSON.stringify(again) === JSON.stringify(hiddenSeq.filter(l => shownAgain.includes(l)));
  for (let i = lost.length - 1; i >= 0; i--) { const j = shownAgain.indexOf(lost[i]); if (j >= 0) { shownAgain.splice(j, 1); lost.splice(i, 1); } }
  const probes = probesAt.length, read = Object.keys(R().loyal).length;
  // Probes while passing through, or within the calm time after a blow.
  const early = step ? onTheWay : probesAt.filter(p => hurtAt.some(h => p.t >= h && p.t - h < 2000)).length;
  // Mobs that stayed 2 s in a calm room, read.
  const wantRead = step ? 1 : 24;
  return { lost, ansShown, probes, read, again: again.length, orderOk, early, wantRead };
}

let fails = 0;
for (const prompts of [true, false]) for (const mode of ["walk", "fast", "follow", "linger", "arrive", "attacked", "busy"]) {
  for (const order of ["A", "B", "AB", "BA", "AAB"]) {
    const r = run(mode, order, prompts);
    const bad = r.lost.length || r.ansShown.length || !r.orderOk || r.early || r.read < r.wantRead;
    if (bad) fails++;
    console.log((bad ? "FAIL " : "ok   ") + (prompts ? "prompt  " : "custom  ") + mode.padEnd(9) + order.padEnd(4)
      + " lost " + r.lost.length + ", answers shown " + r.ansShown.length + ", probes " + r.probes + ", read " + r.read + "/" + r.wantRead
      + (r.early ? ", EARLY probes " + r.early : "") + (r.again ? ", shown again " + r.again + (r.orderOk ? " in order" : " OUT OF ORDER") : "")
      + (r.lost.length ? "  e.g. " + JSON.stringify(r.lost.slice(0, 2)) : "") + (r.ansShown.length ? "  shown " + JSON.stringify(r.ansShown.slice(0, 2)) : ""));
  }
}
console.log(fails ? fails + " problem(s)" : "0 problems");
process.exit(fails ? 1 : 0);
