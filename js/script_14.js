
/* ===================== Check recommendations =====================
   A self-test of the Violations & fixes recommendations on the loaded job (same checks as the regression harness):
   - every pole's recommended fix is re-checked on its own column (sheet rows + pole-wide checks) and for layout sanity
     (comms 40"/44" under the power, proposed 12" over the comms, nothing above the new pole top, items the layout doesn't place);
   - the fix is typed into a copy of the Job JSON as Katapult MR moves and read back the way Load after JSON reads it,
     pole by pole and then the whole job at once; every pole has to come back clean;
   - uplift on raised / replaced poles is listed.
   Nothing on the sheet changes: the columns are restored afterwards and nothing is saved. */
(function(){
  if(typeof renderNotes!=="function" || !window.DG) return;
  const sleep = () => new Promise(r=>setTimeout(r, 0));
  const scidOf = g => (POLES.find(p=>p.id===g.base.node)?.scid) || g.base.tag || "?";
  const BAD = /\bundefined\b|\bNaN\b|\[object |Infinity/;
  // the after JSON read quietly: the same columns loadAfterText builds, without render / save / toast
  function afterColumns(j){
    const out = [];
    for(let ci=0; ci<COLS.length;){
      const c = COLS[ci]; if(!(c.node || c.tag)){ out.push(c); ci++; continue; }
      const g = groupOf(ci); out.push(...COLS.slice(g.start, g.start+g.n).filter(x=>!x.after));
      if(g.base.node && j.nodes[g.base.node]) out.push(afterCol(g.det, j)); else if(g.after) out.push(g.after);
      ci = g.start + g.n;
    }
    return out;
  }
  function withCols(cols, fn){ const keepC = COLS, keepSel = SEL; try{ COLS = cols; return fn(); } finally { COLS = keepC; SEL = keepSel; S = COLS[SEL]; } }
  function setMrAll(o, want, pw){ if(!o || typeof o!=="object") return; for(const [k,v] of Object.entries(o)){
      if(k==="wire" && v && typeof v==="object"){ for(const w of Object.values(v)){ if(w && w._trace){ if(want[w._trace]!=null && pw[w._trace]) w.mr_move = Math.round(want[w._trace] - pw[w._trace].h); else if(w.mr_move!=null) w.mr_move = 0; } } }
      else if(k==="equipment" && v && typeof v==="object"){ for(const [eid,e] of Object.entries(v)){ if(want["eq:"+eid]!=null && typeof e._measured_height==="number") e.mr_move = Math.round(want["eq:"+eid] - e._measured_height); else if(e.mr_move!=null) e.mr_move = 0; } }
      else if(k==="mr_move") o[k] = 0;
      else if(v && typeof v==="object") setMrAll(v, want, pw); } }
  function stripReplacement(n, pf){
    n.attributes = n.attributes || {}; Object.keys(n.attributes).forEach(key=>{ if(key.toLowerCase().replace(/[^a-z]/g,"")==="proposedpolespec") delete n.attributes[key]; });
    Object.values(pf?.pole_top||{}).forEach(pt=>{ if(pt && pt.mr_note) pt.mr_note = ""; });
    if(n.attributes.note) Object.keys(n.attributes.note).forEach(key=>{ n.attributes.note[key] = String(n.attributes.note[key]).replace(/^\s*proposed pole spec\s*:.*$/gim, ""); });
  }
  // what a designer types into Katapult for this pole's recommendation (the layout table's moves)
  function fixOf(s){
    const g = groupOf(s), D = DG.poleData(g), V = violations(s), P = fixPlan(s); S = COLS[SEL]; const R = DG.decide(D, P, V); S = COLS[SEL];
    if(!R.T) return {g, D, V, P, R};
    const pw = K.poleWires(K.mainPhoto(JOB, JOB.nodes[g.base.node]) || {}), want = {}, rows = DG.layout(D, R.T);
    rows.forEach(r=>{ if(r.t && r.nw!=null) want[r.t] = r.nw; });
    rows.forEach(r=>{ if(r.kind==="comm" && r.t && pw[r.t] && r.old!=null && r.nw!=null) want[r.t] = pw[r.t].h + (r.nw - r.old); });
    if(R.T.after.prop?.trace && pf(R.T.after.prop.height)!=null) want[R.T.after.prop.trace] = pf(R.T.after.prop.height);
    const others = {};
    Object.entries(R.T.om||{}).forEach(([kk, tm])=>Object.entries(tm).forEach(([t, d])=>{ const sp = g.det.spans[kk], cn = JOB.connections?.[sp?.cid];
      const oid = sp?.oid || (cn ? (cn.node_id_1===g.base.node ? cn.node_id_2 : cn.node_id_1) : null); if(!oid) return;
      const opw = K.poleWires(K.mainPhoto(JOB, JOB.nodes[oid])||{}); if(opw[t]) (others[oid] ||= {})[t] = opw[t].h + d; }));
    return {g, D, V, P, R, rows, want, others, node:g.base.node, replace: R.mode==="replace" ? `${R.T.opt.size}-${R.T.opt.cl}` : null};
  }
  const pf = v => { const x = parseFt(v); return x==null || isNaN(x) ? null : x; };
  function buildJson(fixes){
    const j = JSON.parse(JSON.stringify(JOB)), nodeWant = {}, conflicts = [];
    fixes.forEach(f=>{ nodeWant[f.node] = {...(nodeWant[f.node]||{}), ...f.want}; });
    fixes.forEach(f=>Object.entries(f.others||{}).forEach(([oid, w])=>{ const cur = nodeWant[oid] ||= {}; Object.entries(w).forEach(([t,h])=>{ if(cur[t]!=null && Math.abs(cur[t]-h) > 1) conflicts.push({f, oid, t, h, cur:cur[t]}); cur[t] = Math.max(cur[t] ?? -Infinity, h); }); }));
    Object.entries(j.nodes).forEach(([nid, n])=>{ const p = K.mainPhoto(j, n); if(!p) return; const pw = K.poleWires(K.mainPhoto(JOB, JOB.nodes[nid]) || {}); stripReplacement(n, p); setMrAll(p, nodeWant[nid]||{}, pw); });
    fixes.forEach(f=>{ if(f.replace) j.nodes[f.node].attributes.proposed_pole_spec = {check:`${f.replace} Southern Pine`}; });
    return {j, conflicts};
  }
  const openV = (s) => violations(s, true).list.filter(v=>!(v.prop && /GC$|BC$/.test(v.code)));   // the proposed's estimated-midspan checks are advisory
  async function run(onProgress){
    const issues = [], info = [], poles = [], starts = groupStarts();
    const add = (sev, sc, msg) => (sev==="info" ? info : issues).push({sc, msg});
    const keepSel = SEL, snap = JSON.stringify(COLS), keepAfter = JOB_AFTER;
    try{
      // 1. each pole: decision, its own column, layout sanity, text
      const fixes = [];
      for(let i=0;i<starts.length;i++){
        const s = starts[i]; onProgress && onProgress(i/starts.length*0.45, "Checking each pole's recommendation…"); await sleep();
        let f; try{ SEL = s; S = COLS[SEL]; f = fixOf(s); }catch(e){ add("err", "?", "error: " + e.message); continue; }
        const sc = scidOf(f.g), R = f.R; poles.push({sc, mode:R.mode, n:f.V.list.length, forProposed:!!R.forProposed});
        if(f.g.after && !violations(s, true).list.length) { poles[poles.length-1].done = true; }
        if(!R.T || !(R.mode==="comm"||R.mode==="raise"||R.mode==="replace")) continue;
        try{ const VA = violationsOf(R.T.after, "").list.filter(v=>!(v.prop && /GC$|BC$/.test(v.code))); S = COLS[SEL]; if(VA.length) add("err", sc, `recommended ${R.mode} still has ${VA.map(v=>`${v.code} ${v.who}`).join(", ")} on its own column`); }catch(e){ add("err", sc, "error: " + e.message); }
        const rows = f.rows || [];
        const pw = rows.filter(r=>r.kind==="power" && r.name!=="Primary" && !r.drip && !r.street && !r.equip).map(r=>r.nw), drips = rows.filter(r=>r.drip && !r.street).map(r=>r.nw);
        const comm = rows.filter(r=>r.kind==="comm" && !r.guy && !/zayo/i.test(r.name)), prop = rows.find(r=>r.kind==="prop");
        const lowP = pw.length ? Math.min(...pw) : null, lowD = drips.length ? Math.min(...drips) : null;
        comm.forEach(c=>{ if(lowP!=null && c.nw > lowP - 40 + 0.5) add("err", sc, `${c.name} ${fi(c.nw)} is within 40" of the power ${fi(lowP)}`); if(lowD!=null && c.nw > lowD - 40 + 0.5) add("err", sc, `${c.name} ${fi(c.nw)} is within 40" of the drip loop ${fi(lowD)}`); });
        if(prop && prop.nw!=null && comm.length){ const top = Math.max(...comm.map(c=>c.nw)); if(prop.nw < top + 12 - 0.5) add("err", sc, `proposed ${fi(prop.nw)} isn't 12" over the top comm ${fi(top)}`); }
        if(R.mode==="replace" && R.T.top!=null) rows.forEach(r=>{ if(r.nw!=null && r.nw > R.T.top + 0.5) add("err", sc, `${r.name} ${fi(r.nw)} is above the new pole top ${fi(R.T.top)}`); });
        rows.filter(r=>r.unplaced).forEach(r=>add("info", sc, `${r.name} isn't placed by the layout: set it by hand`));
        try{ DG.uplift(f.D, R.T).filter(u=>u.risk).forEach(u=>add("info", sc, `uplift: ${u.span} → ${u.to} (${u.len}′), ${u.wire} ${fi(u.diff)} higher, limit ${fi(u.lim)}`)); }catch(e){}
        try{ const d = document.createElement("div"); d.innerHTML = window.__dgCard(f.D, f.P, f.V).html; S = COLS[SEL]; const m = BAD.exec(d.textContent||""); if(m) add("err", sc, `card shows "${m[0]}"`); }catch(e){ add("err", sc, "card error: " + e.message); }
        fixes.push({...f, sc, mode:R.mode, open:f.V.list.length});
      }
      // 2. round trip, one pole at a time
      const rt = fixes.filter(f=>f.open);
      for(let i=0;i<rt.length;i++){
        const f = rt[i]; onProgress && onProgress(0.45 + i/Math.max(1,rt.length)*0.45, `Typing each fix into Katapult and reading it back (${f.sc})…`); await sleep();
        try{ const {j} = buildJson([f]); const cols = afterColumns(j);
          withCols(cols, ()=>{ const s = groupStarts().find(x=>groupOf(x).base.node===f.node); const g = groupOf(s);
            if(!g.after) add("err", f.sc, "no After MR column after reading the fix back");
            else { const A = openV(s); if(A.length) add("err", f.sc, `${f.mode} fix read back from Katapult still has: ${A.map(v=>`${v.code} ${v.who} ${v.k||"pole"} ${v.note||""}`).join(" | ")}`); } });
        }catch(e){ add("err", f.sc, "round trip error: " + e.message); }
      }
      // 3. the whole job at once
      onProgress && onProgress(0.93, "Whole job at once…"); await sleep();
      try{ const {j, conflicts} = buildJson(fixes); conflicts.forEach(c=>add("err", c.f.sc, `its fix moves a comm at the next pole to ${fi(c.h)}, that pole's own fix puts it at ${fi(c.cur)}`));
        const cols = afterColumns(j);
        withCols(cols, ()=>{ for(const s of groupStarts()){ const g = groupOf(s), f = fixes.find(x=>x.node===g.base.node); if(!f || !g.after) continue; const A = openV(s); if(A.length) add("err", f.sc, `with the whole job done, still open: ${A.map(v=>`${v.code} ${v.who}`).join(", ")}`); } });
      }catch(e){ add("err", "job", "whole-job error: " + e.message); }
    } finally { COLS = JSON.parse(snap); JOB_AFTER = keepAfter; SEL = keepSel; S = COLS[SEL]; }
    onProgress && onProgress(1, "Done");
    return {issues, info, poles, n:fixes_count(poles)};
  }
  const fixes_count = poles => poles.filter(p=>p.mode==="comm"||p.mode==="raise"||p.mode==="replace").length;
  function report(r){
    const M = {comm:"Comm moves", raise:"Secondary raise", replace:"Replacement", midspan:"Midspan pole", none:"Not fixable on the pole alone"};
    const counts = {}; r.poles.forEach(p=>{ if(p.n || p.forProposed) counts[p.mode] = (counts[p.mode]||0) + 1; });
    const ok = !r.issues.length;
    return `<h3>Check recommendations</h3>
      <p>${r.poles.length} poles · ${Object.entries(counts).map(([m,n])=>`${n} ${E(M[m]||m)}`).join(" · ") || "no violations"}</p>
      <p class="${ok?"ck-ok":"ck-bad"}">${ok ? `✓ Every recommended fix comes back clean: on its own column, typed into Katapult and read back pole by pole, and with the whole job done.` : `✗ ${r.issues.length} problem${r.issues.length>1?"s":""} with the recommendations. Don't follow these poles' recommendations as-is: check them by hand and send the Job JSON + SCID so the tool can be fixed.`}</p>
      ${r.issues.length ? `<table><thead><tr><th>SCID</th><th>Problem</th></tr></thead><tbody>${r.issues.map(x=>`<tr><td>${E(x.sc)}</td><td>${E(x.msg)}</td></tr>`).join("")}</tbody></table>` : ""}
      ${r.info.length ? `<p class="ck-info">To look at (not errors):</p><table><tbody>${r.info.map(x=>`<tr><td>${E(x.sc)}</td><td>${E(x.msg)}</td></tr>`).join("")}</tbody></table>` : ""}
      <p class="muted" style="font-size:12px">Nothing on the sheet was changed. Poles marked "not fixable on the pole alone" or "midspan pole" aren't round-tripped; their card lists what to try.</p>
      <div style="text-align:right"><button type="button" class="primary" id="ck-close">Close</button></div>`;
  }
  const E = s => esc(String(s==null?"":s));
  async function start(){
    if(!JOB || !groupStarts().length){ toast("Load a Job JSON and fill the poles first."); return; }
    const m = document.createElement("div"); m.className = "ck-modal"; m.innerHTML = `<div class="ck-box"><h3>Check recommendations</h3><p id="ck-msg">Starting…</p><div class="ck-prog"><div id="ck-bar"></div></div></div>`; document.body.appendChild(m);
    const r = await run((p, msg)=>{ const b = m.querySelector("#ck-bar"), t = m.querySelector("#ck-msg"); if(b) b.style.width = Math.round(p*100)+"%"; if(t) t.textContent = msg; });
    m.querySelector(".ck-box").innerHTML = report(r);
    m.querySelector("#ck-close").onclick = () => m.remove();
    m.addEventListener("click", e=>{ if(e.target===m) m.remove(); });
    try{ renderNotes(); }catch(e){}
  }
  window.VDSCheck = {run, start};
  // the button lives at the top of the Violations & fixes panel (the Sheet tools bar stays lean)
  const base = renderNotes;
  renderNotes = function(){ base.apply(this, arguments);
    try{ const el = $("notes"); if(!el || !JOB || el.querySelector(".ck-bar")) return;
      const hd = el.querySelector(".np-head"); (hd ? hd : el).insertAdjacentHTML(hd ? "afterend" : "afterbegin", `<div class="ck-bar"><button type="button" id="ck-run">Check recommendations</button><span class="muted">Tests every pole's recommended fix on the whole job (about a minute).</span></div>`);
      el.querySelector("#ck-run").onclick = start; }catch(e){}
  };
})();
