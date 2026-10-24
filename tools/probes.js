// probes.js -- Here's silent loyal probe against the game, packet by packet
// (#393). Each packet carries its text and a prompt, the prompt ahead of the
// text or after it; every probe is answered in order: before the next room
// (walking), in the same packet as it (walking fast), or after its text
// (following, when the game moves you first), or with a mob walking into the
// room you stand in, and attacking before the answer comes. Checks that no room, say or
// arrival line is hidden and no probe answer shows. Every packet ends with
// its prompt line (a standard one, or one Here can't recognise), and the
// prompt line must never be hidden.
//   node tools/probes.js [dist]      exit 1 on any problem
"use strict";
const path = require("path");
const sim = require("./sim.js");
const P = sim.loadDist(process.argv[2] || path.join(__dirname, "..", "dist"), ["loom", "room"]);
sim.use(P);
function run(MODE, ORDER, PROMPTS) {
  const names=["loom","room"];
  sim.newWorld(names,{}); global.nexusclient={add_html_line:()=>{}};
  sim.load("install"); for(const [m,a] of sim.GOOD.filter(g=>!/^Room|Char.Items|IRE.Target|Comm/.test(g[0]))) sim.gmcp(m,a); sim.flush();
  const W=sim.W, R=()=>client.loom.room;
  const badHidden=[], ansShown=[], replayed=[]; let kind="", gagged=false;
  // Lines room shows again (one block, lines split by "\n"), in the order shown.
  const keep=t=>{ for (const l of String(t).replace(/<[^>]+>/g,"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").split("\n")) replayed.push(l.trim()); };
  const hiddenSeq=[];
  global.nexusclient={add_html_line:keep}; const dn=global.display_notice; global.display_notice=(t,c)=>{ keep(t); };
  global.gag_current_line=()=>{ gagged=true; if(kind!=="answer") { badHidden.push(W.line); hiddenSeq.push(W.line.trim()); } };
  let pk=0;
  // Each packet arrives `ms` after the last: 150 by default, a round trip, so
  // an answer comes 150 ms after its probe; an attack can come much sooner.
  function packet(gmcps, lines, ms){ sim.advance(ms === undefined ? 150 : ms); const ahead=ORDER[pk++%ORDER.length]==="A";
    for(const g of gmcps) sim.gmcp(g[0],g[1]);
    if(ahead) { sim.gmcp("Char.Vitals",sim.GOOD[2][1]); }
    // The packet's prompt line closes its text, as Nexus hands it to triggers;
    // with PROMPTS off, a custom prompt (health and mana, other wording).
    const all=lines.concat([[PROMPTS?"7547h, 5989m, 35230e, 30144w exkdb-":"[H:3000 M:2000] >","prompt"]]);
    for(const [t,k] of all){ kind=k; gagged=false; sim.line(t); if(k==="answer"&&!gagged) ansShown.push(t); }
    if(!ahead) { sim.gmcp("Char.Vitals",sim.GOOD[2][1]); }
    sim.flush(); }
  let seen=0; const probes=()=>{ const o=W.sent.slice(seen).filter(c=>/^probe \d+/.test(c)); seen=W.sent.length; return o; };
  const MOB={}; let here=0;
  function answerLines(cmd, curRoom){ const id=cmd.split(" ")[1]; const m=MOB[id];
    if(!m || m.room!==curRoom) return [["What do you wish to examine?","answer"]];
    return [["Dressed in a white tunic, "+m.name+" fidgets constantly.","answer"],[m.name+" is quite powerful.","answer"],["He has 100% health remaining.","answer"],["He weighs about 90 pounds.","answer"],["He is loyal to "+(m.owner||"Luman Village")+".","answer"],["You see nothing in it.","answer"]]; }
  function roomG(n){ here=n; const id=String(5000+n); MOB[id]={room:n,name:"Nulem"+n,owner:n%4===0?"Falau":""};
    return [["Room.Info",{num:100+n,name:"Room "+n+" by the sea",area:"Luman",environment:"Road",exits:{n:1},details:[]}],["Char.Items.List",{location:"room",items:[{id,name:"an unruly young boy",attrib:"m"}]}]]; }
  const roomL=n=>[...(MODE==="follow"?[["You follow Corwen to the north.","room"]]:[]),["Room "+n+" by the sea. (road)","room"],["Dawn breaks across the land. An unruly young boy stands here.","room"],["You see exits leading north and south.","room"]];
  packet(roomG(0), roomL(0));
  let out=probes();
  for(let n=1;n<=24;n++){
    if(MODE==="walk"){ packet([], out.flatMap(c=>answerLines(c,here))); out=probes(); packet(roomG(n), roomL(n)); }
    else if(MODE==="fast"){ const a=out.flatMap(c=>answerLines(c,here)); out=[]; packet(roomG(n), a.concat(roomL(n))); }
    else if(MODE==="follow"){ const prev=out; out=[]; const g=roomG(n); packet(g, roomL(n).concat(prev.flatMap(c=>answerLines(c,n)))); }
    else if(MODE==="arrive"){ packet([], out.flatMap(c=>answerLines(c,here))); out=probes();
    // A mob walks into the room you stand in.
    const id=String(7000+n); MOB[id]={room:here,name:"Gnoll"+n,owner:""};
    packet([["Char.Items.Add",{location:"room",item:{id,name:"a gnoll sentinel",attrib:"m"}}]], [["A gnoll sentinel enters from the north.","room"]]); out=out.concat(probes()); }
    else if(MODE==="attacked"){ packet([], out.flatMap(c=>answerLines(c,here))); out=probes();
    // A mob walks in and attacks before the game answers the probe (Ricardo's
    // ROOM PROBE DEBUG, 2026-10-24): an unrequested packet comes first.
    const id=String(8000+n); MOB[id]={room:here,name:"Bunyip"+n,owner:""};
    packet([["Char.Items.Add",{location:"room",item:{id,name:"a bunyip",attrib:"m"}}]], [["Slowly rising from the swampy waters is a hulking bunyip.","room"]]); out=out.concat(probes());
    // The first attack 30 ms after the probe (too soon to be its answer); on
    // odd rooms a second one at 140 ms, after that window.
    packet([], [["A bunyip's eyes gleam as you are butchered with a wicked blow.","room"],["Health lost: 888 (physical blunt).","room"]], 30);
    if(n%2) packet([], [["Fire erupts in your side as a bunyip carves you up.","room"],["Health lost: 544 (physical cutting).","room"]], 110); }
  else if(MODE==="stand"){ packet([], out.flatMap(c=>answerLines(c,here))); out=probes(); packet([], [["Ilsabet arrives from the north.","room"]]); out=out.concat(probes()); packet(roomG(n), roomL(n)); }
    out=out.concat(probes());
    if(n%3===0){ sim.gmcp("Comm.Channel.Text",{channel:"says",talker:"Corwen",text:'Corwen says, "Room '+n+'."'}); packet([], [['Corwen says, "Room '+n+'."',"room"]].concat(out.flatMap(c=>answerLines(c,here)))); out=probes(); }
  }
  packet([], out.flatMap(c=>answerLines(c,here))); packet([],[]); packet([],[]);
  const loy=Object.keys(R().loyal).length;
  // Shown again in the order they were hidden?
  const orderOk = JSON.stringify(replayed.filter(l=>hiddenSeq.includes(l))) === JSON.stringify(hiddenSeq.filter(l=>replayed.includes(l)));
  const shownAgain = replayed.filter(l=>hiddenSeq.includes(l)).length;
  // A hidden line shown again (replayed) by room isn't lost.
  for (let i=badHidden.length-1;i>=0;i--){ const j=replayed.indexOf(badHidden[i].trim()); if(j>=0){ replayed.splice(j,1); badHidden.splice(i,1); } }
  return { bad: badHidden, shown: ansShown, probes: W.sent.filter(c=>/^probe \d+/.test(c)).length, ok: loy, again: shownAgain, orderOk };
  //`${MODE.padEnd(6)} ${ORDER.padEnd(4)} hidden-wrongly ${String(badHidden.length).padStart(2)}  answers-shown ${String(ansShown.length).padStart(2)}  probes ${W.sent.filter(c=>/^probe \d+/.test(c)).length}  probed-ok ${loy}`+(badHidden.length?"  e.g. "+JSON.stringify(badHidden.slice(0,2)):"")+(ansShown.length?"  shown e.g. "+JSON.stringify(ansShown.slice(0,2)):""));
}
let fails = 0;
for (const prompts of [true, false]) for (const mode of ["walk", "fast", "follow", "stand", "arrive", "attacked"]) {
  for (const order of ["A", "B", "AB", "BA", "AAB"]) {
    const r = run(mode, order, prompts);
    const bad = r.bad.length || r.shown.length || !r.orderOk || (mode !== "follow" && r.ok < r.probes);
    if (bad) fails++;
    console.log((bad ? "FAIL " : "ok   ") + (prompts ? "prompt  " : "custom  ") + mode.padEnd(7) + order.padEnd(4) + " hidden " + r.bad.length + ", answers shown " + r.shown.length + ", probes " + r.probes + ", read " + r.ok + (r.again ? ", shown again " + r.again + (r.orderOk ? " in order" : " OUT OF ORDER") : "")
      + (r.bad.length ? "  e.g. " + JSON.stringify(r.bad.slice(0, 2)) : "") + (r.shown.length ? "  shown " + JSON.stringify(r.shown.slice(0, 2)) : ""));
  }
}
console.log(fails ? fails + " problem(s)" : "0 problems");
process.exit(fails ? 1 : 0);
