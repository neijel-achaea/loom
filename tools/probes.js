// probes.js -- Here's silent loyal probe against the game, packet by packet
// (#393). Each packet carries its text and a prompt, the prompt ahead of the
// text or after it; every probe is answered in order: before the next room
// (walking), in the same packet as it (walking fast), or after its text
// (following, when the game moves you first). Checks that no room, say or
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
  const badHidden=[], ansShown=[]; let kind="", gagged=false;
  global.gag_current_line=()=>{ gagged=true; if(kind!=="answer") badHidden.push(W.line); };
  let pk=0;
  function packet(gmcps, lines){ const ahead=ORDER[pk++%ORDER.length]==="A";
    for(const g of gmcps) sim.gmcp(g[0],g[1]);
    if(ahead) { sim.gmcp("Char.Vitals",sim.GOOD[2][1]); }
    // The packet's prompt line closes its text, as Nexus hands it to triggers;
    // with PROMPTS off, a custom prompt (health and mana, other wording).
    const all=lines.concat([[PROMPTS?"7547h, 5989m, 35230e, 30144w exkdb-":"[H:3000 M:2000] >","prompt"]]);
    for(const [t,k] of all){ kind=k; gagged=false; sim.line(t); if(k==="answer"&&!gagged) ansShown.push(t); }
    if(!ahead) { sim.gmcp("Char.Vitals",sim.GOOD[2][1]); }
    sim.flush(); sim.advance(10); }
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
    else if(MODE==="stand"){ packet([], out.flatMap(c=>answerLines(c,here))); out=probes(); packet([], [["Ilsabet arrives from the north.","room"]]); out=out.concat(probes()); packet(roomG(n), roomL(n)); }
    out=out.concat(probes());
    if(n%3===0){ sim.gmcp("Comm.Channel.Text",{channel:"says",talker:"Corwen",text:'Corwen says, "Room '+n+'."'}); packet([], [['Corwen says, "Room '+n+'."',"room"]].concat(out.flatMap(c=>answerLines(c,here)))); out=probes(); }
  }
  packet([], out.flatMap(c=>answerLines(c,here))); packet([],[]); packet([],[]);
  const loy=Object.keys(R().loyal).length;
  return { bad: badHidden, shown: ansShown, probes: W.sent.filter(c=>/^probe \d+/.test(c)).length, ok: loy };
  //`${MODE.padEnd(6)} ${ORDER.padEnd(4)} hidden-wrongly ${String(badHidden.length).padStart(2)}  answers-shown ${String(ansShown.length).padStart(2)}  probes ${W.sent.filter(c=>/^probe \d+/.test(c)).length}  probed-ok ${loy}`+(badHidden.length?"  e.g. "+JSON.stringify(badHidden.slice(0,2)):"")+(ansShown.length?"  shown e.g. "+JSON.stringify(ansShown.slice(0,2)):""));
}
let fails = 0;
for (const prompts of [true, false]) for (const mode of ["walk", "fast", "follow", "stand"]) {
  for (const order of ["A", "B", "AB", "BA", "AAB"]) {
    const r = run(mode, order, prompts);
    const bad = r.bad.length || r.shown.length || (mode !== "follow" && r.ok < r.probes);
    if (bad) fails++;
    console.log((bad ? "FAIL " : "ok   ") + (prompts ? "prompt  " : "custom  ") + mode.padEnd(7) + order.padEnd(4) + " hidden " + r.bad.length + ", answers shown " + r.shown.length + ", probes " + r.probes + ", read " + r.ok
      + (r.bad.length ? "  e.g. " + JSON.stringify(r.bad.slice(0, 2)) : "") + (r.shown.length ? "  shown " + JSON.stringify(r.shown.slice(0, 2)) : ""));
  }
}
console.log(fails ? fails + " problem(s)" : "0 problems");
process.exit(fails ? 1 : 0);
